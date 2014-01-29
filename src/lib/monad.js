'use strict';

var jump = require ('./jump');

var Monad = function (action) {
  this.action = action;
};

var monad = function (fn) {
  return new Monad (fn);
};

var _value = function (x) {
  return jump (function () {
    return x;
  });
};

var _throw_value = function (e) {
  throw e;
};

Monad.prototype.run = function (cont, fail) {
  var k = cont || _value;
  var f = fail || _throw_value;
  return this.action (k, f).trampoline();
};

var ret = function (v) {
  return monad (function (cont, fail) {
    return jump (function () {
      return cont (v);
    });
  });
};

// var failValue = function (e) {
//   return monad (function (cont, fail) {
//     return jump (function () {
//       return fail (e);
//     });
//   });
// };

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

var fail = function (fun) {
  return monad (function (cont, fail) {
    return jump (function () {
      try {
        return fail (fun ());
      } catch (e) {
        return fail (e);
      }
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

var alt = function (m, handler) {
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

Monad.prototype.alt = function (fun) {
  return alt (this, fun);
};

module.exports = {
  monad: monad
  ,ret: ret
  ,fail: fail
  ,exec: exec
};
