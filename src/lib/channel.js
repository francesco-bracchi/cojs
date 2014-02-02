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

var Channel = function () {
  this.receivers = [];
  this.senders = [];
  this.closed = false;
};

var recv = function (ch) {
  return monad (function (cont, fail) {
    ch.receivers.push (function (v) {
      return ch.closed ? fail (channel_closed) : cont (v);
    });
    if (ch.senders.length > 0) {
      return jump(ch.senders.shift());
    }
    return jump (function () { return 'recv'; });
  });
};

var send = function (ch, v) {
  return monad (function (cont, fail) {
    
    ch.senders.push (function () {
      return ch.closed ? fail(channel_closed) : cont();
    });

    if (ch.receivers.length > 0) {
      return jump (function () { return ch.receivers.shift()(v); });
    }
    return jump (function () { return 'send'; });
  });
};

Channel.prototype.send = function (v) {
  return send (this, v);
};

Channel.prototype.recv = function () {
  return recv (this);
};

Channel.prototype.close = function () {
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
// be sure to call all the listeners
var buffered_recv = function (ch) {
  return monad (function (cont, fail) {
    var resume = function () {
      return ch.closed && ch.buffer.empty() ? fail (channel_closed) : cont (ch.buffer.deq());
    };
    if (! ch.buffer.empty()) {
      return jump (resume);
    }
    ch.receivers.push(resume);
    if (ch.senders.length > 0) {
      return jump(ch.senders.shift());
    }
    return jump (function () { return 'recv'; });
  });
};
/**
 * remember to restart when the goroutine ends without
 * having filled out the buffer.
 */
var buffered_send = function (ch, v) {
  return monad (function (cont, fail) {
    var resume= function () {
      return ch.closed ? fail (channel_closed) : cont (ch.buffer.enq(v));
    };
    if (! ch.closed && ! ch.buffer.full()) {
      return jump (resume);
    }
    ch.senders.push(resume);
    if (ch.receivers.length > 0) {
      return jump (ch.receivers.shift());
    }
    return jump (function () { return 'send'; });
  });
};

BufferedChannel.prototype.recv = function () {
  return buffered_recv (this);
};

BufferedChannel.prototype.send = function (v) {
  return buffered_send (this, v);
};

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
