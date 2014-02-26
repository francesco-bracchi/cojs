var mvar = require("./mvar"),
    alt = require ("./alt");

var Chan = function () {
  var hole = mvar();
  this.takeVar = mvar(hole);
  this.putVar = mvar(hole);
};

var put = function (chan, val) {
  var newHole = mvar();
  return act {
    val oldHole = ? chan.putVar;
    chan.putVar ! newHole;
    oldHole ! [val, newHole];
  };
};

var take = function (chan) {
  return act {
    val tail = ?chan.takeVar;
    val pair = ?tail;
    chan.takeVar ! pair[1];
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
