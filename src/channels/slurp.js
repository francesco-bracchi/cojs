var fs = require('fs'),
    utils = require ('./utils');

slurp = function (path, options) {
  return util.withChan(function (ch) {
    fs.readFile (path, options, function (err, data) {
      go if (! err) {
        send data -> ch; 
      } 
      ch.close();
    });
  });

}
module.exports = slurp;
