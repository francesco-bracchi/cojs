'use strict';
// This module contains the basic monad constructors.

var Action = require ('./action'),
    Trampoline = require ('./trampoline');

// ### Return
// 
// the argument is a function that is evaluated, the result is the value yielded
// by the action (like the `return` action in a monad). If some exception is 
// raised then the fail action is invoked.
var ret = function (fun) {
  return new Action (function (cont, fail, active) {
    return new Trampoline(function () {
      try {
	return cont (fun(), fail, active);
      } catch (e) {
	return fail (e, cont, active);
      }
    });
  });
};

// ### Return unboxed
// It's the same of return but the value is unboxed
// can be used to speedup the execution, if evaluating the content is not needed
var retU = function (v) {
  return new Action (function (cont, fail, active) {
    return new Trampoline(function () {
      return cont (v, fail, active);
    }); 
  }); 
};

// ### Undef(ined)
// simple constant action that returns undefined
var undef = retU();

// ### Fail
// Like ret instead it invokes the fail action. In case of exception the 
// exception is raised before raising the passed value.
var fail = function (fun) {
  return new Action (function (cont, fail, active) {
    return new Trampoline(function () {
      try {
        return fail (fun (), cont, active);
      } catch (e) {
        return fail (e, cont, active);
      }
    });
  });
};

// ### Fail Unboxed
// the same of fail except err is supposed to be an unboxed value
var failU = function (err) {
  return new Action (function (cont, fail, active) {
    return new Trampoline(function () {
      try {
        return fail (err, cont, active);
      } catch (e) {
        return fail (e, cont, active);
      }
    });
  });
};

module.exports = {
  ret: ret,
  retU: retU,
  fail: fail,
  failU: failU,
  undef: undef
};
