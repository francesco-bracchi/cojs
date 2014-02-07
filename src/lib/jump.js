'use strict';

var Jump = function (fn) {
  this.bounce = fn;
};

var trampoline = function (f) {
  while (f instanceof Jump) {
    f = f.bounce();
  }
  return f;
};

Jump.prototype.trampoline = function () {
  // return trampoline (this);
  var f = this;
  while (f instanceof Jump) {
    f = f.bounce();
  };
  return f;
};

module.exports = Jump;
