var fs = require('fs');

var SlurpError = function (e) {
    this.error = e;
};

var slurp = function (path, options) {
    var ch = channel();
    fs.readFile(path, options, function (err, data) {
	if (err) {
	    go send new SlurpError(err) -> ch;
	} else {
	    go send data -> ch;
	}
    });
    return ch;
};

slurp.Error = SlurpError;

module.exports = slurp;
