var chan = require ('./chan'),
    Monad = require ('./monad'),
    Jump = require ('./jump');

var ret = function (fun) {
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

module.exports = {
  ret: ret,
  fail: fail,
  chan: chan
};
