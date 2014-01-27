
var Jump = function (f) {
    this.bounce = f;
};

var jump = function (fn) {
    return new Jump (fn);
};

var trampoline = function (f) {
  while (f instanceof Jump) {
    f = f.bounce();
  }
  return f;
};

Jump.prototype.trampoline = function () {
  return trampoline (this);
};


var then = function (f, g) {
  return jump(function () {
    return f instanceof Jump ? then (f.bounce(), g) : g;
  });
};

Jump.prototype.then = function (f) {
  return then (this, f);
};

module.exports = jump;
