var mvar = require("./mvar");

var Chan = function () {
  var hole = mvar();
  this.takeVar = mvar(hole);
  this.putVar = mvar(hole);
};

var put = function (chan, val) {
  var newHole = mvar();
  return go_eval {
    take oldHole <- chan.putVar;
    put newHole -> chan.putVar;
    put [val, newHole] -> oldHole;
  };
};

var take = function (chan) {
  return go_eval {
    take tail <- chan.takeVar;
    take pair <- tail;
    put pair[1] -> chan.takeVar;
    pair[0];
  };
};

Chan.prototype.take = function () {
  return take(this);
};

Chan.prototype.put = function (val) {
  return put (this, val);
};

module.exports = function () {
  return new Chan();
};
