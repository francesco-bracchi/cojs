'use strict';

var Queue = require('./linkedListQueue'),
    Trampoline = require('./trampoline'),
    Action = require('./action'),
    alt = require('./alt');

// set the global variable _cojs
require ('./index');

// ## Mvar
//
// creates an object that can contain a value.
// it implements 2 methods, `put` and `take` that return actions

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

// ## Take
// returns an action that takes the value held by the mvar.
// This means that if the mvar doesn't contain a value, the 
// action continuation is saved into the mvar suspended queue,
// and resumed later when a value is put in it.
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

// ## Put
// Put is the dual of `take`, it returns an action that puts a 
// value into the mvar.
// if a value is already present, the action continuation is 
// saved into the mvar suspended queue, and resumed later when the
// value is taken from the mvar by a `take`.
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
