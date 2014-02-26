var proxy = function (m, o) {
  fork {
    val x = ?m;
    o! x;
  }
};

var alt = function (m, n) {
  var o = mvar();
  proxy (m, o);
  proxy (n, o);
  return o;
};

module.exports = alt;
