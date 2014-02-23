var mvar = require("./mvar"),
    alt = require ("./alt");

var Chan = function () {
  var hole = mvar();
  this.takeVar = mvar(hole);
  this.putVar = mvar(hole);
};

var put = function (chan, val) {
  var newHole = mvar();
  return action {
    take oldHole <- chan.putVar;
    put newHole -> chan.putVar;
    put [val, newHole] -> oldHole;
  };
};

var take = function (chan) {
  return action {
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

Chan.prototype.alt = function (n) { 
  return alt (this, n);
};

module.exports = function () {
  return new Chan();
};
