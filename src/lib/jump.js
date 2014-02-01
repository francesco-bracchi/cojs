
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

module.exports = jump;
