'use strict';

var with_mvar = require ('./with_mvar');

var timeout = function (ms, val) {
  if (val === undefined) val = null;
  return with_mvar (function (mv) {
    setTimeout (function () {
      fork { mv ~> val; }
    }, ms);
  });
};

module.exports = timeout;
