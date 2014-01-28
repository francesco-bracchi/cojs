var chan = require ('./lib/channel'),
    monad = require ('./lib/monad'),
    jump = require ('./lib/jump');

module.exports = {
  // jump
  jump: jump

  // channel
  ,chan: chan

  // monad
  ,monad: monad.monad
  ,ret: monad.ret
  ,fail: monad.fail
  ,exec: monad.exec
};

var global = (function () {
  return this;
}).call(null);

global.__async__ = module.exports;
