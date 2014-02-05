var chan = require ('../lib/channel');

var withChan = function (fun) {
  var ch = chan();
  fun (ch);
  return ch;
};

module.exports = {
  withChan: withChan
};
