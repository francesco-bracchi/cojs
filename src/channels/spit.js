'use strict';

var fs = require('fs'),
    utils = require ('./utils');

var spit = function (path, data, options) {
  return util.withChan(function (ch) {
    fs.writeFile(path, data, options, function (err) {
      go if (! err) {
        send true -> ch;
      }
      ch.close();
    });
  });
};

module.exports = spit;
