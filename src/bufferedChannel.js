// A buffered channel do not suspend itself one `recv` (`send`) operation 
// until the buffer is full (empty).
// 
// Be careful with buffered channels, because when a routine ends without
// having filled the buffer, and the channel is not closed, the messages are 
// not delivered.
var Queue         = require ('./data_structures/linkedListQueue'),
    Jump          = require ('./jump'),
    Monad         = require ('./monad'),
    AltChannel    = require ('./altChannel'),
    ChannelClosed = require('./channelClosed');

//### Constructor
var Channel = function (buffer) {
  this.buffer = buffer;
  this.suspend_recv = new Queue();
  this.suspend_send = new Queue();
  this.closed = false;
};

// suspend execution
var suspend = new Jump (function () { 
  return 'suspend';
});

// build a suspended receiver 
var make_receiver = function (ch, cont, fail) {
  return function (s) {
    if (ch.closed) {
      fail (new ChannelClosed (ch), cont, s);
    }
    return cont (ch.buffer.deq(), fail, s);
  };
};

// ### Receive
//
// Builds the receive action on a channel `ch`
var recv = function (ch) {
  return new Monad (function (cont, fail, scheduler) {
    // if channel is closed && buffer is empty raise an exception
    if (ch.closed && ch.buffer.empty()) {
      fail (new ChannelClosed (ch), cont, scheduler);
    }
    // if buffer is not empty, continue with a value
    if (! ch.buffer.empty()) {
      return cont (ch.buffer.deq(), fail, scheduler);
    }
    // otherwise suspend current process
    ch.suspend_recv.enq(make_receiver(ch, cont, fail));

    // and tries to resume a process blocked on sending
    if (! ch.suspend_send.empty()) {
      var sender = ch.suspend_send.deq();
      scheduler.enq(sender);
    }
    // if no more active processes suspend execution
    if (scheduler.empty()) {
      return suspend;
    }
    // otherwise resume a process from the active queue (`scheduler`)
    var next = scheduler.deq();
    return next (scheduler);
  });
};

var undirty = function (ch) {
  return function (s) {
    ch.dirty = false;
    if (ch.suspend_recv.empty()) {
      return suspend;
    }
    var receiver = ch.suspend_recv.deq();
    return receiver (s);
  };
};

// ###  Send
//
// Build a send action on channel `ch`
var send = function (ch, v) {
  return new Monad(function (cont, fail, scheduler) {
    // if channel is closed raise an exception
    if (ch.closed) {
      fail (new ChannelClosed(ch), cont, scheduler);
    }
    ch.buffer.enq(v);
    // if the `Buffer` is not full, continue
    if (! ch.buffer.full()) {
      if (! ch.dirty) scheduler.enq(undirty(ch));
      ch.dirty = true;
      return cont (undefined, fail, scheduler);
    }
    // otherwise check if some process is waiting for data. in case 
    // resume it passing `v` to it, and schedule current continuation
    // to be executed (put it in `schedule` buffer)
    if (! ch.suspend_recv.empty()) {
      var receiver = ch.suspend_recv.deq();
      scheduler.enq (function (s) { return cont (undefined, fail, s); });
      return receiver(scheduler);
    }
    // if no process is waiting for data, suspend current process
    // **before** sending data (not `cont`) because it has to be sent again
    ch.suspend_send.enq (function (s) {
      if (ch.closed) { 
        return fail (new ChannelClosed(ch), cont, s);
      }
      var receiver = ch.suspend_recv.deq();
      s.enq(function (s) { return cont (undefined, fail, s); });
      return receiver (s);
    });
    // then tries to resume some active process from `scheduler`
    if (scheduler.empty()) {
      return suspend;
    }
    var next = scheduler.deq();
    return next (scheduler);
  });
};

// attach to the main object
Channel.prototype.recv = function () {
  return recv (this);
};

Channel.prototype.send = function (v) {
  return send (this, v);
};

// ### Close
//
// When an unbuffered channel is closed, all suspended operations are 
// resumed, raising an error.
Channel.prototype.close = function () {
  if (this.closed) return;
  this.closed = true;
  while (! this.suspend_send.empty()) {
    var sender = this.suspend_send.deq();
    sender (new Queue()).run();
  }
  while (! this.suspend_recv.empty()) {
    var receiver = this.suspend_recv.deq();
    receiver(undefined, new Queue()).run();
  }
};
Channel.prototype.alt = AltChannel.prototype.alt;

module.exports = Channel;

