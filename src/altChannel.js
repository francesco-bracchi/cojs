var Monad = require('./monad'),
    Jump = require('./jump');

// todo:
// instead of the generic thing that we are doing that resends the message to the
// channel (breaking the order)
// we can:
// + call the `left.recv().action (cont, fail, scheduler)`
// + take from `left` the last added element to recv_suspend
// + do the same for `right` (getting a list in cas of altchannels)
// + once one of the actions is resumed, remove these from the list of recv_suspend

var Channel = function (left, right) {
  this.left = left;
  this.right = right;
};

var recv = function (left, right, ch) {
  var leftMonad = left.recv(),
      rightMonad = right.recv();
  return new Monad(function (cont, fail, scheduler) {
    scheduler.enq(function (s) {
      return rightMonad.action (function (v, f1, s1) {
        if (ch.other) {
          return right.send(v, true).action(cont, f1, s1);
        }
        ch.other = left;
        return cont (v, f1, s1);
      }, fail, s);
    });
    return leftMonad.action(function (v, f1, s1) {
      if (ch.other) {
        return left.send(v, true).action (cont, f1, s1);
      }
      ch.other = right;
      return cont (v, f1, s1);
    }, fail, scheduler);
  });
};

Channel.prototype.recv = function () {
  return recv (this.left, this.right, this);
};

var suspend = new Jump(function () { return 'suspend'; });

Channel.prototype.send = function (v) {
  if (this.other) {
    return this.other.send (v, true);
  }
  return suspend;
};

Channel.prototype.alt = function (right) {
  return new Channel (this, right);
};

module.exports = Channel;
