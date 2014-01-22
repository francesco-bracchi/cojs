
var Jump = function (f) {
  this.f = f;
};

var jump = function (f) {
  return new Jump (f);
};

var identity = function (v) { return v; };

var go_run = function (m) {
  var j = m (identity);
  while (j instanceof Jump) { j = j(); }
  return j;
};

var go_return = function (v) {
  return function (cont) {
    return jump(function () {
      return cont (v);
    });
  };
};

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

// var go_seq = function (m, n) {
//   return go_bind (m, function () { return n; });
// };

var go_take = function (ch) {
  return function (cont) {
    return ch.take (function (v) { go_run (cont (v)); });
  };
};

var go_put = function (v, ch) {
  return function (cont) {
    return ch.put (v, function () { go_run (cont (v)); });
  };
};

macro go_let {
  rule {
    $($v = $e (,) ...) in $e ;
  } => {
    (function () {
      var $v = $e (,) ... ;
      return ( $e );
    });
  }
}

macro go {
  rule {
    go { $e ... }
  } => {
    go_run (go_walk { $e ... });
  }
}

macro go_walk {
  rule {
    { recv $v:lit <- $ch; $e ... }
  } => {
    go_bind(go_take($ch), function ($v) { return go_walk { $e ... } });
  }
  rule {
    { send $v -> $ch; $e ... }
  } => {
    go_bind(go_send(v, $ch), function ($v) { return go_walk { $e ... } });
  }

  // while
  rule {
    { while ( $t ) { $b ... } $e ... }
  } => {
    go_let p = go_walk { $b ... },
           q = go_walk { $e ... },
           r = function (ign) {
             return ( $t ) ? go_bind (p, r) : q;
           }
      in r();
  }

  // do while
  rule {
    { do { $b ... } while ( $t ) $e ... }
  } => {
    go_let p = go_walk { $b ... },
           q = go_walk { $e ... },
           r = function () {
             return ( $t ) ? go_bind (p, r) : q;
          }
      in go_bind(p, r);
  }

  rule {
    { if ($a) { $b ... } $e ... }
  } => {
    go_let p = go_walk { $b ... },
           q = go_walk { $e ... }
      in ( $a ) ? go_seq (p , q) : q;
  }

  rule {
    { if ($a) { $b ... } else { $c ... } $e ... }
  } => {
    go_let p = go_walk { $b ... },
           q = go_walk { $c ... },
           r = go_walk { $e ... }
      in ( $a ) ? go_seq(p, r) : go_seq (q, r);
  }
  rule {
    { $a ; $as ... }
  } => {
    go_seq(go_return( $a ), go_walk { $as ... });
  }
}
