'use strict';

var jump = require ('./jump');

var Monad = function (action) {
  this.action = action;
};

var monad = function (fn) {
  return new Monad (fn);
};

var initial_continuation = function (v, fail, queue) {
  return v;
};

var initial_fail = function (e, cont, queue) {
  throw e;
};

Monad.prototype.run = function () {
  return this.action (initial_continuation, initial_fail, []).trampoline();
};

var ret = function (v) {
  return monad (function (cont, fail, queue) {
    return jump (function () {
      return cont (v, fail, queue);
    });
  });
};

var exec = function (fun) {
  return monad (function (cont, fail, queue) {
    return jump (function () {
      try {
	return cont (fun(), fail, queue);
      } catch (e) {
	return fail (e, cont, queue);
      }
    });
  });
};

var fail = function (fun) {
  return monad (function (cont, fail, queue) {
    return jump (function () {
      try {
        return fail (fun (), cont, queue);
      } catch (e) {
        return fail (e, cont, queue);
      }
    });
  });
};

var bind = function (m, next) {
  return monad (function (cont, fail, queue) {
    return jump(function () {
      return m.action (function (v, fail1, queue1) {
	return jump (function () {
          return next(v).action (cont, fail1, queue1);
	});
      }, fail, queue);
    });
  });
};

var alt = function (m, handler) {
  return monad (function (cont, fail, queue) {
    return jump(function () {
      return m.action (cont, function (err, cont1, queue1) {
        return jump (function () {
          return handler(err).action (cont1, fail, queue1);
        });
      }, queue);
    });
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
  ret: ret,
  fail: fail,
  exec: exec
};
