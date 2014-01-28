var fs = require('fs');

var SpitError = function (e) {
  this.error = e;
};

var spit = function (path, data, options) {
  var ch = channel();
  fs.writeFile(path, data, options, function (err) {
	  if (err) {
      go send new SpitError (err) -> ch;
	  } 
	  else {
	    go send true -> ch;
	  }
  });
  return ch;
};

spit.Error = SpitError;

module.exports = slurp;
