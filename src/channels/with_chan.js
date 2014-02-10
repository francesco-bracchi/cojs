var chan = require ('../chan');

var withChan = function (fun) {
  var ch = chan();
  fun (ch);
  return ch;
};

module.exports = withChan;
