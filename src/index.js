var chan = require ('./lib/channel'),
    timeout = require ('./channels/timeout'),
    monad = require ('./lib/monad'),
    jump = require ('./lib/jump');

module.exports = {
  // jump
  jump: jump

  // timeout
  ,timeout: timeout

  // channel
  ,chan: chan

  // monad
  ,monad: monad.monad
  ,ret: monad.ret
  ,fail: monad.fail
};

var global = (function () {
  return this;
}).call(null);

global.__async__ = module.exports;
