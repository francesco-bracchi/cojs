'use strict';

var chan = require ('../lib/channel');

var timeout = function (ms, val) {
  var ch = chan ();
  setTimeout (function () {
    go { 
      send val -> ch;
      ch.close();
    }
  }, ms);
  return ch;
};

module.exports = timeout;
