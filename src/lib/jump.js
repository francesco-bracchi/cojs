// A `Jump` object is used to implement a **trampoline**  strategy.
// a Jump object implement the `trampoline` method, that calls 
// the jump argument until it is different from a `Jump`, that's 
// the value.

'use strict';

var Jump = function (fn) {
  this.bounce = fn;
};

Jump.prototype.trampoline = function () {
  var f = this;
  while (f instanceof Jump) {
    f = f.bounce();
  };
  return f;
};

module.exports = Jump;
