/**
 * TODO:
 * 1. Implement Buffered channel
 * 2. Implement ch.close method
 * 3. Implement fancy buffers (dropfirst, droplast)
 * 4. Test, Test, Test
 */

'use strict';

var jump = require ('./jump.js'),
    monad = require ('./monad.js').monad;

var channel_closed = new Error ('Channel is Closed');

// var Buffer = function (size) {
//   this.size = size;
//   this.data = [];
// };

// Buffer.prototype.enq = function (v) {
//   if (this.full()) {
//     throw new Error ("buffer full");
//   }
//   this.data.push (v);
// };

// Buffer.prototype.deq = function () {
//   if (this.empty()) {
//     throw new Error ('buffer empty');
//   }
//   return this.data.shift();
// };

// Buffer.prototype.bound = function () {
//   return this.size !== undefined;
// };

// Buffer.prototype.full = function () {
//   return this.bound() && this.data.length >= this.size;
// };

// Buffer.prototype.empty = function () {
//   return this.data.length <= 0;
// };

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
  // if (this.empty()) {
  //   throw new Error ('empty buffer');
  // }
  this.rear = ++ this.rear % this.size;
  return this.data [this.rear];
};

Buffer.prototype.empty = function () {
  return this.front == this.rear && !this.isfull;
};

Buffer.prototype.full = function () {
  return this.isfull;
};

var Channel = function () {
  this.receivers = [];
  this.senders = [];
  this.closed = false;
};

var UnbufferedChannel = function () {
  Channel.call (this);
};

UnbufferedChannel.prototype = new Channel();

var unbuffered_recv = function (ch) {
  return monad (function (cont, fail) {
    ch.receivers.push (function (v) {
      return ch.closed ? fail (channel_closed) : cont (v);
    });
    if (ch.senders.length > 0) {
      return ch.senders.shift()();
    }
    return jump (function () { return 'recv'; });
  });
};

var unbuffered_send = function (ch, v) {
  return monad (function (cont, fail) {
    ch.senders.push (function () {
      if (ch.closed) {
        return fail (channel_closed);
      }
      return ch.receivers.shift()(v).concat (cont());
    });
    return ch.receivers.length > 0
      ? ch.senders.shift()()
      : jump (function () { return 'send'; });
  });
};

UnbufferedChannel.prototype.send = function (v) {
  return unbuffered_send (this, v);
};

UnbufferedChannel.prototype.recv = function () {
  return unbuffered_recv (this);
};

UnbufferedChannel.prototype.close = function () {
  this.closed = true;
  while (this.receivers.length > 0) {
    this.receivers.shift()().trampoline();
  }
  while (this.senders.length > 0) {
    this.senders.shift()().trampoline();
  }
};

var BufferedChannel = function (buffer) {
  Channel.call (this);
  this.buffer = buffer;
};

BufferedChannel.prototype = new Channel();

var resumeSend = function (ch) {
  if (ch.senders.length === 0) {
    return jump (function () { return undefined; });
  }
  var resumeSender = ch.senders.shift(),
      resumeAgain = jump(function () {
        return resumeSend (ch);
      });
  return jump(resumeSender).concat(resumeAgain);
};

var resumeRecv = function (ch) {
  if (ch.receivers.length === 0) {
    return jump (function () { return undefined; });
  }
  var resume = ch.receivers.shift(),
      resumeAgain = jump(function () { return resumeRecv(ch); });

  return jump(resume).concat(resumeAgain);
};

var buffered_recv = function (ch) {
  return monad (function self (cont, fail) {
    if (ch.closed) {
      return fail (channel_closed);
    }
    if (! ch.buffer.empty()) {
      var me = jump(function () { return cont (ch.buffer.deq()); }),
          rs = jump(function () { return resumeSend(ch); });
      return me.concat(rs);
    }
    ch.receivers.push (function () {
      return self(cont, fail);
    });
    return jump(function() { return undefined; });
  });
};

var buffered_send = function (ch, v) {
  return monad (function self (cont, fail) {
    if (ch.closed) {
      return fail (channel_closed);
    }
    if (! ch.buffer.full()) {
      var me = jump(function () { ch.buffer.enq(v); return cont(); }),
          rs = jump(function () { return resumeRecv(ch); });
      return me.concat(rs);
    }
    ch.senders.push (function () { return self (cont, fail); });
    return jump (function () { return undefined; });
  });
};

BufferedChannel.prototype.recv = function () {
  return buffered_recv (this);
};

BufferedChannel.prototype.send = function (v) {
  return buffered_send (this, v);
};

BufferedChannel.prototype.close = function () {
  this.closed = true;
  while (this.receivers.length > 0) {
    this.receivers.shift()().trampoline();
  }
  while (this.senders.length > 0) {
    this.senders.shift()().trampoline();
  }
};
var chan = function (size) {
  if (typeof size === 'number' && size > 0) {
    return new BufferedChannel (new Buffer (size));
  }
  // if (size instanceof Buffer) {
  //   return new BufferedChannel(size);
  // }
  return new UnbufferedChannel();
};

chan.Buffer = Buffer;

module.exports = chan;
