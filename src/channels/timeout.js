'use strict';

var with_mvar = require ('./with_mvar');

var timeout = function (ms, val) {
  return with_mvar (function (mv) {
    setTimeout (function () {
      fork put val -> mv;
    }, ms);
  });
};

module.exports = timeout;
