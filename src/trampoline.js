// A `Trampoline` object is used to implement the **trampoline**  strategy.
// see: [trampoline on wikipedia](https://en.wikipedia.org/wiki/Trampoline_%28computers%29#High_level_programming)

'use strict';

var Trampoline = function (fn) {
  this.bounce = fn;
};

Trampoline.prototype.jump = function () {
  var f = this;
  while (f instanceof Trampoline) {
    f = f.bounce();
  };
  return f;
};

module.exports = Trampoline;