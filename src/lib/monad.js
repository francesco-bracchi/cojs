'use strict';

var Jump = require ('./jump');

var Monad = function (action) {
  this.action = action;
};

var monad = function (fn) {
  return new Monad (fn);
};

var initial_continuation = function (v, fail, active) {
  if (active.length > 0) {
    var next = active.shift();
    return next(active);
  }
  return v;
};

var initial_fail = function (e, cont, active) {
  throw e;
};

Monad.prototype.run = function () {
  return this.action (initial_continuation, initial_fail, []).trampoline();
};

var ret = function (v) {
  return monad (function (cont, fail, active) {
    return new Jump (function () {
      return cont (v, fail, active);
    });
  });
};

var exec = function (fun) {
  return monad (function (cont, fail, active) {
    return new Jump (function () {
      try {
	return cont (fun(), fail, active);
      } catch (e) {
	return fail (e, cont, active);
      }
    });
  });
};

var fail = function (fun) {
  return monad (function (cont, fail, active) {
    return new Jump (function () {
      try {
        return fail (fun (), cont, active);
      } catch (e) {
        return fail (e, cont, active);
      }
    });
  });
};

var bind = function (m, next) {
  return monad (function (cont, fail, active) {
    //return new Jump(function () {
      return m.action (function (v, fail1, active1) {
	return new Jump (function () {
          return next(v).action (cont, fail1, active1);
	});
      }, fail, active);
    //});
  });
};

var alt = function (m, handler) {
  return monad (function (cont, fail, active) {
    // return new Jump(function () {
      return m.action (cont, function (err, cont1, active1) {
        return new Jump (function () {
          return handler(err).action (cont1, fail, active1);
        });
      }, active);
    // });
  });
};

Monad.prototype.bind = function (fun) {
  return bind (this, fun);
};

Monad.prototype.alt = function (fun) {
  return alt (this, fun);
};

module.exports = {
  monad: monad,
  Monad: Monad,
  ret: ret,
  fail: fail,
  exec: exec
};
