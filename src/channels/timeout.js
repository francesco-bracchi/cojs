'use strict';

var utils = require ('./utils');

var timeout = function (ms, val) {
  return util.withChan(function (ch) {
    setTimeout (function () {
      go send val -> ch;
      ch.close();
    }, ms);
  });
};

module.exports = timeout;
