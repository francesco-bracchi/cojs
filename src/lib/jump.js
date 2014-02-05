
'use strict';
var Jump = function (fn) {
  this.bounce = fn;
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

// var then = function (j, k) {
//   return jump (function () {
//     return j instanceof Jump ? then (j.bounce(), k) : k;
//   });
// };

// Jump.prototype.then = function (j) {
//   return then (this, j);
// };

module.exports = jump;
