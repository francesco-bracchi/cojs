var ChannelClosed = require('./channelClosed'),
    Queue = require('./data_structures/linkedListQueue'),
    Trampoline = require('./trampoline'),
    Action = require('./action');

var Mvar = function () {
  this.suspended_take = new Queue();
  this.suspended_put = new Queue();
};

var suspend = function (tid) {
  new Trampoline(function () { return tid; });
};

var _setActive = function (cont, active) {
  if (cont) active.enq(cont);
};

var _tryToResume = function (active, tid) {
  var next = active.deq();
  return next ? next(active) : suspend (tid);
};

var take = function (mvar) {
  return new Action(function (tid, cont, fail, active) {
    mvar.suspended_take.enq(function (val, active) {
      return cont (val, tid, fail, active);
    });
    _setActive(mvar.suspended_put.deq(), active);
    return _tryToResume(active, tid);
  });
};

var put = function (mvar, val) {
  return new Action(function(tid, cont, fail, active) {
    var reallyPut = function (active) {
      var taker = mvar.suspended_take.deq();
      active.enq(function (active) {
        return cont (undefined, tid, fail, active);
      });
      return taker (val, active);
    };
    if (!mvar.suspended_take.empty()) {
      return reallyPut(active);
    }
    mvar.suspended_put.enq(reallyPut);
    return _tryToResume(active, tid);
  });
};

Mvar.prototype.take = function () {
  return take(this);
};

Mvar.prototype.put = function (val) {
  return put(this, val);
};

module.exports = function () {
  return new Mvar();
};
