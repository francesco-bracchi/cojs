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
  this.data = [];
};

Buffer.prototype.enq = function (v) {
  if (this.full()) {
    throw new Error ("buffer full");
  }
  this.data.push (v);
};

Buffer.prototype.deq = function () {
  if (this.empty()) {
    throw new Error ('buffer empty');
  }
  return this.data.shift();
};

Buffer.prototype.bound = function () {
  return this.size !== undefined;
};

Buffer.prototype.full = function () {
  return this.bound() && this.data.length >= this.size;
};

Buffer.prototype.empty = function () {
  return this.data.length <= 0;
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
  return ch.senders.length > 0 
    ? jump (ch.senders.shift()).concat (jump(function () { return resumeSend(ch); }))
    : jump(function () { return undefined; });
};

var resumeRecv = function (ch) {  
  return ch.receivers.length > 0 
    ? jump (ch.receivers.shift()).concat (jump(function () { return resumeRecv(ch); }))
    : jump(function () { return undefined; });
};

var buffered_recv = function (ch) {
  return monad (function (cont, fail) {
    var resume = function () {
      return ch.closed ? fail (channel_closed) : cont (ch.buffer.deq());
    };
    if (ch.buffer.empty()) {
      ch.recivers.push (resume);
      resumeSend(ch);
    }
    return jump (resume).concat(resumeSend (ch));
  });
};

var buffered_send = function (ch, v) {
  return monad (function (cont, fail) {
    var resume = function () {
      return ch.closed ? fail (channel_closed) : cont (ch.buffer.enq (v)); 
    };
    if (ch.buffer.full()) {
      ch.senders.push (resume);
      return resumeRecv (ch);
    }
    return jump (resume).concat(resumeRecv(ch));
  });
};

BufferedChannel.prototype.recv = function () {
  return buffered_recv (this);
};

BufferedChannel.prototype.send = function (v) {
  return buffered_send (this, v);
};

var chan = function (size) {
  // if (typeof size === 'number' && size > 0) {
  //   return new BufferedChannel (new Buffer (size));
  // }
  // if (size instanceof Buffer) {
  //   return new BufferedChannel(size);
  // }
  return new UnbufferedChannel();
};

chan.Buffer = Buffer;

module.exports = chan;
