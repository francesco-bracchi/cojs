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
  var v = this.action (initial_continuation, initial_fail, []);
  while (v instanceof Jump) {
    v = v.bounce();
  }
  return v;
};

var cheney = function (fun) {
  try {
    return fun();
  } catch (e) {
    return new Jump(fun);
  }
};

var ret = function (v) {
  return new Monad (function (cont, fail, active) {
    return cheney(function () {
      return cont (v, fail, active);
    });
  });
};

var exec = function (fun) {
  return new Monad (function (cont, fail, active) {
    return cheney(function () {
      try {
	return cont (fun(), fail, active);
      } catch (e) {
	return fail (e, cont, active);
      }
    });
  });
};

var fail = function (fun) {
  return new Monad (function (cont, fail, active) {
    return cheney(function () {
      try {
        return fail (fun (), cont, active);
      } catch (e) {
        return fail (e, cont, active);
      }
    });
  });
};

var r = 0;
var bind = function (m, next) {
  return new Monad (function (cont, fail, active) {
    return m.action (function (v, fail1, active1) {
      return cheney(function () { 
        return next(v).action (cont, fail1, active1); 
      });
    }, fail, active);
  });
};

var alt = function (m, handler) {
  return monad (function (cont, fail, active) {
    return m.action (cont, function (err, cont1, active1) {
      return cheney(function () {
        return handler(err).action (cont1, fail, active1);
      });
    }, active);
  });
};

Monad.prototype.bind = function (fun) {
  return bind (this, fun);
};

Monad.prototype.alt = function (fun) {
  return alt (this, fun);
};

module.exports = {
  /* monad: monad, */
  Monad: Monad,
  ret: ret,
  fail: fail,
  exec: exec
};
