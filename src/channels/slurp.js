'use strict';

var fs = require('fs'),
    withChan = require ('./with_chan');

var slurp = function (path, options) {
  return withChan(function (ch) {
    fs.readFile (path, options, function (err, data) {
      go {
        if (! err) {
          send data -> ch;
        }
        ch.close();
      }
    });
  });
};

module.exports = slurp;
