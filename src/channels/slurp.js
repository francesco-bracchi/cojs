'use strict';

var fs = require('fs'),
    utils = require ('./utils');

var slurp = function (path, options) {
  return utils.withChan(function (ch) {
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
