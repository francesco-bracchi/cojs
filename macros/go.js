macro goexpr {
  rule {
    {
      recv $v:ident <- $ch:expr;
      $gs ...
    }
  } => {
    $ch . recv () . bind (function ( $v) { return goexpr { $gs ... } } )
  }

  rule {
    {
      send $m:expr -> $ch:expr;
    }
  } => {
    ( $ch ) . send ( $m )
  }
  rule {
    {
      send $m:expr -> $ch:expr;
      $gs ...
    }
  } => {
    ( $ch ) . send ( $m ) . bind (function ( ) { return goexpr { $gs ... } } )
  }

  rule {
    {
      while ( $t:expr ) { $b ... }
      $gs ...
    }
  } => {
			(function () {
    			var b = goexpr { $b ... };
					var r = goexpr { $gs ... };
					var loop = function () { return ( $t ) ? b.bind (loop) : r; };
          return loop ();
      }())
  }

  rule {
    {
      while ( $t:expr ) $e:expr ;
      $gs ...
    }
  } => {
    goexpr { while ( $t ) { $e } $gs ... }
  }

  rule {
    {
      do { $b ... } while ( $t:expr ) ;
      $gs ...
    }
  } => {
    (function () {
      var b = goexpr { $b ... };
      var r = goexpr { $gs ... };
      var loop = function () { return ( $t ) ? b.bind (loop) : r; };
      return b.bind(loop);
    }())
  }
  // todo: handle the case of { return $e ; $g ... } (raising an error at macroexpansion time?)
  rule {
    { return $e:expr ; }
  } => {
    __async__ . exec ( function () { return $e } )
  }

  // todo: handle the case of { throw $e ; $g ... } (raising an error at macroexpansion time?)
  rule {
    { throw $e:expr ; }
  } => {
    __async__ . fail ( function () { return $e } )
  }

  rule {
    { if ( $t ) { $l ... } else { $r ... } $gs ... }
  } => {
    ( ( $t ) ? ( goexpr { $l ... } ) : ( goexpr { $r ... } ) ). bind ( function () { return goexpr { $gs ... } } )
  }

  rule {
    { try { $e ... } catch ( $ex:ident ) { $f ... } $gs ... }
  } => {
    ( goexpr { $e ... } ) . alt ( function ( $ex ) { return goexpr { $f ... }; } ) . bind ( function ( ) { return goexpr { $gs ... }; } )
  }

  rule {
    { $e:expr ; }
  } => {
      __async__. exec ( function () { return $e ; } )
  }

  rule {
    { $g:expr ; $gs ... }
  } => {
    ( goexpr { $g ; } ) .bind ( function ( ) { return goexpr { $gs ... } ; } )
  }

  rule {
    { var $a:ident = $e:expr (,) ... ; $gs ... }
  } => {
    (function () {
      var $a (,) ... ;
      return __async__.exec (function () { $a = $e (;) ... }).bind ( goexpr { $gs ... } );
    }());
  }

  rule {
    { $v:ident = $e:expr ; $gs ... }
  } => {
      __async__.exec (function () { $v = $e ; }).bind ( $goexpr { $gs ... } )
  }

  rule {
    {}
  } => {
    __async__.ret(undefined);
  }
}

macro go {
  rule {
    { $e ... }
  } => {
    ( goexpr { $e ... } ).run();
  }

  rule {
    while ( $t:expr ) { $b ... }
  } => {
    go { while ( $t ) { $b ... } }
  }

  rule {
    while ( $t:expr ) $b:expr;
  } => {
    go while ( $t ) { $b }
  }

  rule {
			do { $b ... } while ( $t:expr ) ;
  } => {
    go { do { $b ... } while ( $t ) ; }
  }

  rule {
    send $m:expr -> $ch:expr ;
  } => {
    go { send $m -> $ch; }
  }
}

export go;
export goexpr;
