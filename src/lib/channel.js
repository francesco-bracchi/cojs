
// TODO:
// 1. Implement Buffered channel
// 2. Implement ch.close method
// 3. Implement fancy buffers (dropfirst, droplast)
// 4. Test, Test, Test

'use strict';

var Jump = require ('./jump.js'),
    Monad = require ('./monad.js').Monad,
    scheduler = require ('./scheduler.js');

// Channel Closed Error
var ChannelClosed = function (ch) {
  this.channel = ch;
  this.message = "Channel Closed";
};

var isClosed = function (ch) {
  return new ChannelClosed (ch);
};

// Buffer
var Buffer = function (size) {
  this.size = size;
  this.data = new Array (size);
  this.front = 0;
  this.rear = 0;
  this.isfull = false;
};

Buffer.prototype.enq = function (v) {
  if (this.isfull) {
    throw new Error ('buffer is full');
  }
  this.front = ++ this.front % this.size;
  this.data[this.front] = v;
  this.isfull = this.front == this.rear;
};

Buffer.prototype.deq = function () {
  if (this.isfull) {
    this.isfull = false;
  }
  this.rear = ++ this.rear % this.size;
  return this.data [this.rear];
};

Buffer.prototype.empty = function () {
  return this.front == this.rear && !this.isfull;
};

Buffer.prototype.full = function () {
  return this.isfull;
};

// ## Channel
//
// A channel is an object that implements the 2 methods 
// `recv()` and `send(v)`.
// 
// These 2 methods returns a monad, (see `"./monad.js"`).
//
// Another important method is `close()`.

// ### Unbuffered Channel
//
// Unbuffered channels suspend the routine on `recv` or `send` operations,
// and tries to resume a routine suspended on the opposite operation.
// For example the routine A calls `recv` and no routines are suspended 
// on a `send` operation, the routine A gets suspended.
//
// At some point another routine B calls `send(v)` on the same channel.
// Then the routine A is resumed, passing the value v to the continuation of A.
//
// When the routine A ends or gets suspended again, the routine B is resumed.

var Channel = function () {
  this.suspend_recv = [];
  this.suspend_send = [];
  this.closed = false;
};

var stop = new Jump (function () { 
  return 'stop';
});

var make_receiver = function (ch, cont, fail) {
  return function (v, a) {
    return ch.closed ? fail(new ChannelClosed(ch), cont, a) : cont(v, fail, a);
  };
};

var recv = function (ch) {
  return new Monad(function (cont, fail, active) {
    if (ch.closed) {
      fail (new ChannelClosed (ch), cont, active);
    }
    ch.suspend_recv.push(make_receiver(ch, cont, fail));
    if (ch.suspend_send.length > 0) {
      var sender = ch.suspend_send.shift();
      active.push(sender);
    }

    if (active.length > 0) {
      var next = active.shift();
      return next (active);
    }
    return stop;
  });
};

// todo: simplify and clarify this mess
var send = function (ch, v) {
  return new Monad(function (cont, fail, active) {
    if (ch.closed) {
      fail (new ChannelClosed(ch), cont, active);
    }
    if (ch.suspend_recv.length > 0) {
      var receiver = ch.suspend_recv.shift();
      active.push (function (a) { return cont (undefined, fail, a); });
      return receiver(v, active);
    }
    ch.suspend_send.push (function (a) {
      if (ch.closed) { 
        return fail (new ChannelClosed(ch), cont, a);
      }
      var receiver = ch.suspend_recv.shift();
      a.push(function (a1) { return cont (undefined, fail, a1); });
      return receiver (v, a);
    });
    
    if (active.length > 0) {
      var next = active.shift();
      return next (active);
    }
    return stop;
  });
};

Channel.prototype.send = function (v) {
  return send (this, v);
};

Channel.prototype.recv = function () {
  return recv (this);
};

// ### Close
//
// When an unbuffered channel is closed, all suspended operations are 
// resumed, raising an error.
// (To be decided: does the `recv` operation has to raise an error or 
// it has to return immediately undefined).

Channel.prototype.close = function () {
  if (this.closed) return;

  this.closed = true;
  
  // while (this.receivers.length > 0) {
  //   this.receivers.shift()().trampoline();
  // }
  // while (this.senders.length > 0) {
  //   this.senders.shift()().trampoline();
  // }
};

// ## Buffered Channels
//
// A buffered channel do not suspend itself one `recv` (`send`) operation 
// until the buffer is full (empty).
// 
// Be careful with buffered channels, because when a routine ends without
// having filled the buffer, and the channel is not closed, the messages are 
// not delivered.

var BufferedChannel = function (buffer) {
  Channel.call (this);
  this.buffer = buffer;
};

BufferedChannel.prototype = new Channel();
// be sure to call all the listeners
var buffered_recv = function (ch) {
  return new Monad (function (cont, fail) {
    var resume = function () {
      return ch.closed && ch.buffer.empty() ? fail (isClosed(ch)) : cont (ch.buffer.deq());
    };
    if (! ch.buffer.empty()) {
      return new Jump (resume);
    }
    ch.receivers.push(resume);
    if (ch.senders.length > 0) {
      return new Jump(ch.senders.shift());
    }
    return new Jump (function () { return 'recv'; });
  });
};

// remember to restart when the goroutine ends without
// having filled out the buffer.

var buffered_send = function (ch, v) {
  return new Monad (function (cont, fail) {
    var resume= function () {
      return ch.closed ? fail (isClosed(ch)) : cont (ch.buffer.enq(v));
    };
    if (! ch.closed && ! ch.buffer.full()) {
      return new Jump (resume);
    }
    ch.senders.push(resume);
    if (ch.receivers.length > 0) {
      return new Jump (ch.receivers.shift());
    }
    return new Jump (function () { return 'send'; });
  });
};

BufferedChannel.prototype.recv = function () {
  return buffered_recv (this);
};

BufferedChannel.prototype.send = function (v) {
  return buffered_send (this, v);
};

// ## AltChannel 
// 
// AltChannel is the composition of 2 channels. the `recv` operation returns
// the first of the 2 composing channels that has yield a value.

var AltChannel = function (c0, c1) {
  this.c0 = c0;
  this.c1 = c1;
};

AltChannel.prototype.recv = function () {
  return alt_recv (this);
};

var alt_recv = function (ch) {
  return new Monad(function (cont, fail) {
    var m0 = ch.c0.recv(),
        m1 = ch.c1.recv(),
        a0 = m0.action (function (v) {
          if (ch.not_triggered) {
            return ch.c0.send (v).action (cont, fail);
          }
          ch.not_triggered = ch.c1;
          return cont (v);
        }, fail),
        a1 = m1.action (function (v) {
          if (ch.not_triggered) {
            return ch.c1.send (v).action (cont, fail);
          }
          ch.not_triggered = ch.c0;
          return cont (v);
        }, fail);
    a0.trampoline();
    a1.trampoline();
    return new Jump(function () { return undefined; });
  });
};

// This operation is implemented but not effective. 
// 
// The reason of this implementation if in the case of 3 or more channels
// part of an AltChannel.
// 
// When a message from one of the channels resumes the current routine,
// the other channels are not aware that the routine do not need a value any more,
// therefore, the current routine is notified anyway of messaged from the 
// other channels.
// 
// What the routine does in these cases is to resend the message on the channel
// again, therefore can be consumed by another routine.
//
// But in case of combining more than 2 channels, one of the composed channels
// will be an `AltChannel`, to which the message can be sent again, and the 
// channel should be able to redirect to the right real channel.

AltChannel.prototype.send = function (v) {
  if (this.not_triggered) {
    return this.not_triggered.send (v);
  }
  return new Jump (function () { return undefined; });
};

Channel.prototype.alt = AltChannel.prototype.alt = function (c1) {
  return new AltChannel(this, c1);
};

// ## chan
//
// This function is the entry point of the module.
//
//     var ch = chan ();
//
// called in this variant creates an unbuffered channel
//
//     var ch = chan (10);
//
// in this way creates a channel with a buffer of length 10
//
//     var ch = chan(new chan.Buffer (10));
// 
// this is the same of the former. 
//
// You can pass as argument a Buffer instance. A buffer instance is an object 
// that implements `enq` and `deq` methods.

var chan = function (size) {
  if (typeof size === 'number' && size > 0) {
    return chan (new Buffer (size));
  }
  if (size instanceof Buffer) {
    return new BufferedChannel (size);
  }
  return new Channel();
};

chan.Buffer = Buffer;

module.exports = chan;
