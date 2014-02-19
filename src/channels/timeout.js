'use strict';

var with_mvar = require ('./with_mvar');

var timeout = function (ms, val) {
  return with_mvar (function (mv) {
    setTimeout (function () {
      go {
        put val -> mv;
        ch.close();
      }
    }, ms);
  });
};

module.exports = timeout;
