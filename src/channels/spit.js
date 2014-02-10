'use strict';

var fs = require('fs'),
    withChan = require ('./with_chan');

var spit = function (path, data, options) {
  return withChan(function (ch) {
    fs.writeFile(path, data, options, function (err) {
      go {
        if (! err) {
          send true -> ch;
        }
        ch.close();
      }
    });
  });
};

module.exports = spit;
