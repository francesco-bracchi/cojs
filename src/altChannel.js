var Monad = require('./monad'),
    Jump = require('./jump');

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
