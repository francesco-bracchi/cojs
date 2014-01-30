var fs = require('fs');

var slurp = function (path, options) {
  var ch = channel();
  fs.readFile(path, options, function (err, data) {
    go {
      if (! err) {
        send data -> ch;
      }
      ch.close();
    }
  });
};

module.exports = slurp;
