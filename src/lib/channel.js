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
};

var UnbufferedChannel = function () {
    Channel.call (this);
};

UnbufferedChannel.prototype = new Channel();

var unbuffered_recv = function (ch) {
  return monad (function (cont, fail) {
    ch.receivers.push (cont);
    if (ch.senders.length > 0) {
      return ch.senders.shift()();
    }
    return jump (function () { return 'recv'; });
  });
};

var unbuffered_send = function (ch, v) {
  return monad (function (cont, fail) {
    ch.senders.push (function () {
      return ch.receivers.shift()(v).concat (cont('undefined'));
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

var BufferedChannel = function (buffer) {
    Channel.call (this);
    this.buffer = buffer;
};

/**
 * Buffered Channel
 *
 * ### Invariant
 *
 * the total number of calls of recv minus the tocal calls of send is
 * equal to the length of receivers plus buffer minus senders.
 * TODO: write better about this invariant
 */
BufferedChannel.prototype = new Channel();

/**
 * Buffered send
 * + if buffer is full
 * 1. suspend the current routine
 *
 * + if buffer is not full
 * 1. enqueue the yielded value
 * 2. continue with current routine
 * 3. try to resume one receiver
 *
 * Why only one?
 * of course, because of the invariant.
 */
BufferedChannel.prototype.send = function (v, cont) {
    // if buffer is full suspend me
    if (this.buffer.full()) {
	var ch = this;
	this.senders.push (function () { ch.send (v, cont); });
    }
    else {
	this.buffer.enq (v);
	cont();
    }
    if (this.receivers.length > 0 && ! this.buffer.empty()) {
	this.receivers.shift()(this.buffer.deq());
    }
};

BufferedChannel.prototype.recv = function (cont) {
    if (this.buffer.empty()) {
	this.receivers.push (cont);
    } else {
	cont(this.buffer.deq());
    }
    if (this.senders.length > 0) {
	this.senders.shift()();
    }
};

var AltChannel = function (left, right) {
    this.left = left;
    this.right = right;
};

var chan = function (size) {
  var result;
  if (typeof size === 'number' && size > 0) {
    result = new BufferedChannel (new Buffer (size));
  }
  else if (size instanceof Buffer) {
    result = new BufferedChannel(size);
  }
  else {
    result = new UnbufferedChannel();
  }
  return result;
};

chan.Buffer = Buffer;

module.exports = chan;
