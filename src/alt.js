var proxy = function (m, o) {
  fork {
    take x <- m;
    put x -> o;
  };
};

var alt = function (m, n) {
  var o = mvar();
  proxy (m, o);
  proxy (n, o);
  return o;
};

module.exports = alt;
