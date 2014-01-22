macro go {
  rule {
    { $b ... }
  } => {
    runGo ( go_walk { $b ... } );
  }

  rule {
    while ( $t ) { $b ... }
  } => {
    go { while ( $t ) { $b ... } }
  }

  rule {
    while ( $t ) $b
  } => {
    go while ( $t ) { $b  }
  }

  rule {
    do { $b ... } while ( $t )
  } => {
    go { do { $b ... } while ( $t ) }
  }

  rule {
    do $b while ( $t )
  } => {
    go do { $b } while ( $t )
  }

  rule {
    for $e { $b ... }
  } => {
    go { for $e { $b ... } }
  }

  rule {
    for $e $b
  } => {
    go for $e { $b }
  }
}


macro go_walk {
  rule {
    { recv $v:lit <- $e or $c0:expr or $c1:expr or $cs ... ; $e ... }
  } => {
    go_walk {recv $v <- ( $c0 ).orelse ( $c1 ) or $cs ... ; $e ... }
  }
  rule {
    { recv $v:ident <- $c0:expr or $c1:expr ; $e ... }
  } => {
    go_walk { recv $v <- ( $c0 ).orelse ( $c1 ); $e ... }
  }
  rule {
    { recv $v:ident <- $ch:expr ; $e ... }
  } => {
    ( $ch ).take ( function ( $v ) { go_walk { $e ... } })
  }

  rule {
    { send $m -> $ch ; $e ... }
  } => {
    ( $ch ).put ( function () { go_walk { $e ... } });
  }

  rule {
    { while ( $t ) { $b ... } $e ... }
  } => {
    var loop = recur(function () {
      if ( $t ) {
        go_walk { $b ... loop() }
      }
      else {
        go_walk { $e ... }
      }
    });
    loop();
  }

  rule {
    { while ( $t ) $b ; $e ... }
  } => {
    go_walk { while ( $t ) { $b } $e ... }
  }

  rule {
    { do { $b ... } while ( $t ) $e ... }
  } => {
    var loop = recur (function () {
      go_walk { $b ... }
      if ( $t ) return loop ();
      go_walk { $e ... }
    });
    loop ();
  }
}

var Continue = function (fun, context, args) {
  this.fun = fun;
  this.context = context;
  this.args = args;
};

Continue.prototype.call = function () {
  this.fun.apply(this.context, this.args);
};

var recur = function (f) {
  var running;
  return function () {
    var cont = new Continue(f, this, arguments);;
    if (running) return cont;

    running = true;
    while (cont instanceof Continue) {
      cont = cont ();
    }
    running = false;
    return cont;
  };
};
