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
    // send ( $m , $ch )
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
      var loop = function ( ) {
	if ( $t ) {
	  return ( goexpr { $b ... } ) . bind ( loop ) ;
	}
	return goexpr { $gs ... } ;
      };
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
    { throw $e:expr; }
  } => {
    __async__ . fail ( $e )
  }

  rule {
    { if ( $t ) { $l ... } else { $r ... } $gs ... }
  } => {
    (function () {
      var rest = function () { return goexpr { $gs ... } };
      return ( $t )
	? ( goexpr { $l ... } ) . bind ( $rest )
      : ( goexpr { $r ... } ) . bind ( $rest );
    }())
  }

  rule {
    { try { $e ... } catch ( $ex:ident ) { $f ... } $gs ... }
  } => {
    ( goexpr { $e ... } )
      . catchFail ( function ( $ex ) { return goexpr { $f ... }; } )
      . bind ( function ( ) { return goexpr { $gs ... }; } )
  }

  rule {
    { throw $e:expr ; }
  } => {
    (function () {
      try {
        return __async__ . fail ( $e );
      } catch (e) {
        return __async___ . fail ( e );
      }
    }())
  }

  rule {
    { $g:expr ; }
  } => {
    (function () {
      try {
        return __async__. ret ( $g ) ;
      } catch ( e ) {
        return __async__ . fail ( e ) ;
      }
    } () )
  }

  rule {
    { $g:expr ; $gs ... }
  } => {
    ( goexpr { $g } ) .bind ( function ( ) { return goexpr { $gs ... } ; } )
  }

  rule {
    { var $as ... ; $gs ... }
  } => {
    (function () {
      try {
        var $as ... ;
      } catch ( e ) {
        return __async__ . fail ( e );
      }
      return goexpr { $gs ... };
    }());
  }

  rule {
    { $v:ident = $e:expr ; $gs ... }
  } => {
    (function () {
      try {
        $v = $e;
      } catch ( e ) {
        return __async__ . fail ( e );
      }
      return goexpr { $gs ... };
    }())
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
    send $m:expr -> $ch:expr ;
  } => {
    go { send $m -> $ch; }
  }
}

export go;
export goexpr;
