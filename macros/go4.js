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

var go_run = function (monad, cnt) {
  if (! cnt) {
    cnt = identity;
  }
  return trampoline(monad(cnt));
};

// monad operations
// bind
var go_bind = function (m, fn) {
  return function (cont) {
    return jump(function () {
      return m (function (v) {
        return jump (function () {
          var n = fn (v);
          n (cont);
        });
      });
    });
  };
};

// return
var go_return = function (val) {
  return function (cont) {
    return jump (function () {
      return cont (val);
    });
  };
};

// basic operations
var go_take = function (ch) {
  return function (cont) {
    return ch.take (function (v) {
      trampoline(cont (v));
    });
  };
};

var go_put = function (v, ch) {
  return function (cont) {
    return ch.put (v, function () {
      trampoline(cont (v));
    });
  };
};
