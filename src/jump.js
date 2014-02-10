// A `Jump` object is used to implement the **trampoline**  strategy.
// see: [trampoline on wikipedia](https://en.wikipedia.org/wiki/Trampoline_%28computers%29#High_level_programming)

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
