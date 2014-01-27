
var Future = function (f) {
    this.force = f;
};

var future = function (fn) {
    return new Future (fn);
};

var resume = function (f) {
  while (f instanceof Future) {
    f = f.force();
  }
  return f;
};

Future.prototype.resume = function () {
  return resume (this);
};


var seq = function (f, g) {
  return future(function () {
    return f instanceof Future ? seq (f.force(), g) : g;
  });
};

Future.prototype.seq = function (f) {
  return seq (this, f);
};

module.exports = future;
