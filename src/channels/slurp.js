'use strict';

var fs = require('fs'),
    with_mvar = require ('./with_mvar');

var slurp = function (path, options) {
  return with_mvar(function (mv) {
    fs.readFile (path, options, function (err, data) {
      go {
        if (! err) {
          put data -> mv;
        }
      }
    });
  });
};

module.exports = slurp;
