'use strict';

var withChan = require ('./with_chan');

var timeout = function (ms, val) {
  return withChan (function (ch) {
    setTimeout (function () {
      go {
        send val -> ch;
        ch.close();
      }
    }, ms);
  });
};

module.exports = timeout;
