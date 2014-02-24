var Queue = require('./data_structures/linkedListQueue'),
    Trampoline = require('./trampoline'),
    Action = require('./action'),
    alt = require('./alt');

var Mvar = function (val) {
  this.suspended_take = new Queue();
  this.suspended_put = new Queue();
  this.value = val;
};

var _put = function (mvar, v) {
  mvar.value = v;
};

var _take = function (mvar) {
  var v = mvar.value;
  mvar.value = undefined;
  return v;
};

var suspend = new Trampoline(function () { return; });

var _setActive = function (cont, active) {
  if (cont) {
    active.enq(cont);
  }
};

var _tryToResume = function (active) {
  var next = active.deq();
  return next ? next(active) : suspend;
};

var take = function (mvar) {
  return new Action(function (cont, fail, active) {
    var resume = function (active) {
      _setActive(mvar.suspended_put.deq(), active);
      return cont(_take(mvar), fail, active);
    };
    if (mvar.value===undefined) {
      mvar.suspended_take.enq(resume);
      return _tryToResume(active);
    }
    return resume(active);
  });
};

var put = function (mvar, val) {
  return new Action(function(cont, fail, active) {
    var resume = function (active) {
        _setActive(mvar.suspended_take.deq(), active);
        return cont(_put(mvar,val), fail, active);
    };
    if(mvar.value!==undefined) {
      mvar.suspended_put.enq(resume);
      return _tryToResume(active);
    }
    return resume(active);
  });
};

Mvar.prototype.take = function () {
  return take(this);
};

Mvar.prototype.put = function (val) {
  return put(this, val);
};

Mvar.prototype.alt = function (n) {
  return alt (this, n);
};

module.exports = function (val) {
  return new Mvar(val);
};
