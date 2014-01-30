var fs = require('fs');

var spit = function (path, data, options) {
  var ch = channel();
  fs.writeFile(path, data, options, function (err) {
    go {
      if (! err) {
        send true -> ch;
      }
      ch.close();
    }
  });
  return ch;
};

module.exports = slurp;
