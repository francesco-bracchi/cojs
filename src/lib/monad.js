'use strict';

var Jump = require ('./jump'),
    Queue = require ('./queue');

var Monad = function (action) {
  this.action = action;
};

var initial_continuation = function (v, fail, scheduler) {
  if (scheduler.empty()) {
    return v;
  }
  var next = scheduler.deq();
  return next(scheduler);
};

var initial_fail = function (e, cont, scheduler) {
  throw e;
};

Monad.prototype.run = function () {
  var v = this.action (initial_continuation, initial_fail, new Queue());
  while (v instanceof Jump) {
    v = v.bounce();
  }
  return v;
};

var ret = function (v) {
  return new Monad (function (cont, fail, scheduler) {
    return new Jump(function () {
      return cont (v, fail, scheduler);
    });
  });
};

var exec = function (fun) {
  return new Monad (function (cont, fail, scheduler) {
    return new Jump(function () {
      try {
	return cont (fun(), fail, scheduler);
      } catch (e) {
	return fail (e, cont, scheduler);
      }
    });
  });
};

var fail = function (fun) {
  return new Monad (function (cont, fail, scheduler) {
    return new Jump(function () {
      try {
        return fail (fun (), cont, scheduler);
      } catch (e) {
        return fail (e, cont, scheduler);
      }
    });
  });
};

var bind = function (m, next) {
  return new Monad (function (cont, fail, scheduler) {
    return m.action (function (v, fail1, scheduler1) {
      return new Jump(function () { 
        return next(v).action(cont, fail1, scheduler1); 
      });
    }, fail, scheduler);
  });
};

var alt = function (m, handler) {
  return new Monad (function (cont, fail, scheduler) {
    return m.action(cont, function (err, cont1, scheduler1) {
      return new Jump(function () {
        return handler(err).action (cont1, fail, scheduler1);
      });
    }, scheduler);
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
