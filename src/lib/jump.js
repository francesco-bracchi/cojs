
'use strict';

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


var concat = function (f, g) {
  return jump(function () {
    return f instanceof Jump ? concat (f.bounce(), g) : g;
  });
};

Jump.prototype.concat = function (f) {
  return concat (this, f);
};

module.exports = jump;
