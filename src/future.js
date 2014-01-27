
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


var then = function (f, g) {
  return future(function () {
    return f instanceof Future ? then (f.force(), g) : g;
  });
};

Future.prototype.then = function (f) {
  return then (this, f);
};

module.exports = future;
