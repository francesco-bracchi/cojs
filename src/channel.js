var future = require ('./future.js'),
    monad = require ('./monad.js');

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

var Simplechannel = function () {
    Channel.call (this);
};

Simplechannel.prototype = new Channel();

var recv = function (ch) {
  return monad (function (cont, fail) {
    ch.receivers.push (cont);
    if (ch.senders.length > 0) {
      return ch.senders.shift()();
    }
    return future(function () { return 'recv'; });
  });
};

var send = function (ch, v) {
  return monad (function (cont, fail) {
    ch.senders.push (function () {
      return ch.receivers.shift()(v).seq (cont('undefined'));
    });
    return ch.receivers.length > 0
      ? ch.senders.shift()()
      : future (function () { return 'send'; });
  });
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
  } else if (size instanceof Buffer) {
    result = new BufferedChannel(size);
  }
  else {
    result = new SimpleChannel();
  }
  return result;
};

chan.Buffer = Buffer;

module.exports = chan;
