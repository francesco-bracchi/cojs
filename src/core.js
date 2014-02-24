// This is the other entry point of the gozilla lib, but this one is 
// automatically required by `gozilla/macros`. The end user doesn't have to be
// aware of this.
// 
// This module exposes the 2 core actions that can be taken in a monad, i.e. 
// ret(urn) and fail (the others are send and recv, that are generated by the 
// `send` and `recv` methods in `BufferedChannel` or `UnbufferedChannel`). 
// 
// Both of these are supposed to have as argument a function that is evaluated. 
// In this way if the thunk raises an exception, it is correctly handled.

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
var retU = function (v) {
  return new Action (function (cont, fail, active) {
    return new Trampoline(function () {
      return cont (v, fail, active);
    }); 
  }); 
};

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

module.exports = {
  ret: ret,
  retU: retU,
  fail: fail
};
