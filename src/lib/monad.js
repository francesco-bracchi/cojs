
'use strict';

var jump = require ('./jump');

var Monad = function (action) {
  this.action = action;
};

var monad = function (fn) {
  return new Monad (fn);
};

var identity = function (x) {
  return jump (function () {
    return x;
  });
};

var throw_ex = function (e) { throw e; };

Monad.prototype.run = function (cont, fail) {
  return this.action (cont || identity, fail || throw_ex).trampoline();
};

var ret = function (v) {
  return monad (function (cont, fail) {
    return jump (function () {
      return cont (v);
    });
  });
};

var exec = function (fun) {
  return monad (function (cont, fail) {
    return jump (function () {
	try {
	    return cont (fun());
	} catch (e) {
	    return fail (e);
	}
    });
  });
};

var fail = function (e) {
  return monad (function (cont, fail) {
    return jump (function () {
      return fail (e);
    });
  });
};

var bind = function (m, next) {
  return monad (function (cont, fail) {
    return jump(function () {
      return m.action (function (v) {
	return jump (function () {
	  return next(v).action (cont, fail);
	});
      }, fail);
    });
  });
};

var catchFail = function (m, handler) {
  return monad (function (cont, fail) {
    return jump(function () {
      return m.action (cont, function (err) {
        return jump (function () {
          return handler(err).action (cont, fail);
        });
      });
    });
  });
};

Monad.prototype.bind = function (fun) {
  return bind (this, fun);
};

Monad.prototype.catchFail = function (fun) {
  return catchFail (this, fun);
};


module.exports = {
  monad: monad
  ,ret: ret
  ,fail: fail
  ,exec: exec
};
