// A channel is an object that implements the 3 methods 
// `recv()`, `send(v)` and `close()`
// 
// `recv` and `send` are methods that returns a `Monad` object.
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

'use strict';

var Jump = require ('./jump'),
    Queue = require ('./data_structures/linkedListQueue'),
    Monad = require ('./monad'),
    AltChannel = require ('./altChannel'),
    ChannelClosed = require('./channelClosed');

// ### Constructor
var Channel = function () {
  this.suspend_recv = new Queue();
  this.suspend_send = new Queue();
  this.closed = false;
};

Channel.prototype.alt = AltChannel.prototype.alt;

// suspend execution
var suspend = new Jump (function () { 
  return 'suspend';
});

// ### Receive
//
// Build a receive action on channel `ch`
var recv = function (ch) {
  return new Monad(function (cont, fail, scheduler) {
    // if channel is closed emit null
    if (ch.closed) {
      return cont (null, fail, scheduler);
    }
    // otherwise suspend the current process
    ch.suspend_recv.enq(function (v, s) {
      return cont (v, fail, s);
    });
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

// ###  Send
//
// Build a send action on channel `ch`
var send = function (ch, v, requeue) {
  return new Monad(function (cont, fail, scheduler) {
    // if channel is closed raise an exception
    if (ch.closed && !requeue) {
      fail (new ChannelClosed(ch), cont, scheduler);
    }
    // otherwise check if some process is waiting for data. in case 
    // resume it passing `v` to it, and schedule current continuation
    // to be executed (put it in `schedule` buffer)
    if (! ch.suspend_recv.empty()) {
      var receiver = ch.suspend_recv.deq();
      scheduler.enq (function (s) { return cont (undefined, fail, s); });
      return receiver(v, scheduler);
    }
    // if no process is waiting for data, suspend current process
    // **before** sending data (not `cont`) because it has to be sent again
    ch.suspend_send.enq (function (s) {
      if (ch.closed && !requeue) { 
        return fail (new ChannelClosed(ch), cont, s);
      }
      if (ch.suspend_recv.empty()) {
        return suspend;
      }
      var receiver = ch.suspend_recv.deq();
      s.enq(function (s) { return cont (undefined, fail, s); });
      return receiver (v, s);
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
// requeue must be undefined, unless in `AltChannel.send`
Channel.prototype.send = function (v, requeue) {
  return send (this, v, requeue);
};

Channel.prototype.recv = function () {
  return recv (this);
};

// ### Close
//
// When an unbuffered channel is closed, all suspended operations are 
// resumed. (raising an error for `send` actions, returning `null`)
Channel.prototype.close = function () {
  if (this.closed) return;
  this.closed = true;
  while (!this.suspend_send.empty()) {
    var sender = this.suspend_send.deq();
    sender(new Queue()).trampoline();
  }
  while (!this.suspend_recv.empty()) {
    var receiver = this.suspend_recv.deq();
    receiver(undefined, new Queue()).trampoline();
  }
};

module.exports = Channel;
