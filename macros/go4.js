var Jumper = function (cont) {
  this.cont = cont;
};

var jump = function (cont) {
  return new Jumper (cont);
};

var trampoline = function (cont) {
  while (cont instanceof Jumper) {
    cont = cont.cont();
  }
  return cont;
};

var identity = function (x) { return x; };

var go_run = function (monad) {
  return trampoline(monad(identity));
};

var go_return = function (val) {
  return function (cont) {
    return jump (function () {
      return cont (val);
    });
  };
};
