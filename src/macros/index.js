// main macro module

macro core {
  rule {
  } => {
    _cojs
  }
}

macro mret {
  rule {
    ( undefined )
  } => {
    core . retU ()
  }
  rule {
    ( $b:lit )
  } => {
    core . retU ( $b )
  }
  rule {
    ( $b:expr )
  } => {
    core . ret ( function () { return $b } )
  }
}

macro mfail {
  rule {
    ( $e:expr )
  } => {
    core . fail ( function () { return $e; } )
  }
}
macro mseq {
  rule {
    ( $m:expr ,  $n:expr )
  } => {
    ( $m ) . then ( $n )
  }
  rule {
    ( $v:ident = $m:expr,  $e:expr)
  } => {
    ( $m ) . bind ( function ( $v ) { return $e ; } ) 
  }
}

// # mdo
//
// the simpler code walker. every line (ending with `;`) is   
// treated as a monad and bound to the next.
// if the line matches `val v = ...` it's like `<-` haskell operator.
macro mdo {
  rule {
    {}
  } => {
    mret(undefined)
  }
  rule {
    { $e:expr ; }
  } => {
    ( $e )
  }
  rule {
    { $e:expr }
  } => {
    ( $e )
  }
  rule {
    {
      val $v:ident = $e:expr ;
      $es ...
    }
  } => {
    mseq ($v = $e , mdo { $es ... } )
  }
  rule {
    {
      $e:expr ; 
      $es ... 
    }
  } => {
    mseq ( $e , mdo { $es ... } )
  }
}

macro mwhile {
  rule {
    { $test:expr, $body:expr, $rest:expr }
  } => {
    ( function loop () {
      return ( $test ) . bind ( function ( t ) {
        return t ? ( $body ) . bind (loop) : ( $rest ) } );
    } () )
  }
}

macro mdowhile {
  rule {
    { $body:expr, $test: expr, $rest:expr } 
  } => {
    ( function loop () {
      return ( $body ) 
        . then ( $test )
        . bind ( function (t) {
          return t ? loop () : $rest ;
        } ) ;
    } () )
  }
}

macro mif {
  rule {
    { $test:expr , $left:expr , $right:expr }
  } => {
    ( $test ) . bind (function ( test ) {
      return test ? ( $left ) : ( $right ) ;
    } )
  }
}

macro mtry {
  rule {
     $b:expr catch ( $e:ident ) $h:expr
  } => {
    ( $b ) . error ( function ( $e ) { return $h ; } )
  }
}

// # Act 
//
// Another code walker built on top of `mdo`.
// this one mimic closer the javascript behavior (although there are some differences).
// It implements if statements, `for`/`while`/`do-while` loops, try/catch blocks etc.
//
// `val v = ... ` is still the way of getting a monad result, but the straight line is 
// wrapped ina a return statement.
//
// special operators are `!` and '?'.
// the sentence `val v = ?ch` is transformed in `val v = ch.take()` while 
// the sentence `ch! msg` is transformed in `ch.put(msg)`

macro act {
  rule {
    {}
  } => {
    mdo {}
  }
  rule {
    {
      ret $e:expr ;
      $es ...
    }
  } => {
    mdo {
      val e = mret ($e);
      e;
      act { $es ... };
    }
  }
  rule {
    { $e:expr }
  } => {
    mdo { mret ( $e ) }
  }
  rule {
    { $e:expr ; }
  } => {
    mdo { mret ($e) ; }
  }
  rule {
    { $v:ident = $e:expr ; }
  } => {
    mdo { mret (( $v = $e)) ; }
  }
  rule {
    { 
      val $v:ident = $e:expr ; 
      $es ... 
    }
  } => {
    mdo {
      val e = mret ( $e ) ;
      val $v = e;
      act { $es ... }
    }
  }
  // todo: optimize the case of mvar is a literal/identifier for `?` and `!`
  rule {
    {
      val $v:ident = ? $mvar:expr ; 
      $es ...
    }
  } => {
    act {
      val $v = $mvar . take () ;
      $es ...
    }
  }
  rule {
    {
      $v:ident = ? $mvar:expr ; 
      $es ...
    }
  } => {
    act {
      val v = ? $mvar:expr ; 
      $v = v ;
      $es ...
    }
  }
  rule {
    {
      $mvar:expr ! $val:expr
    }
  } => {
    act {
      $mvar ! $val ;
    }
  }
  rule {
    {
      $mvar:expr ! $val:expr ;
      $es ...
    }
  } => {
    act {
      ret ( $mvar . put ( $val ) );
      $es ...
    }
  }
  rule {
    {
      $v:ident = $e:expr ;
      $es ...
    }
  } => {
    act {
      ( $v = $e ) ;
      $es ... 
    }
  }
  rule {
    {
      var $( $v:ident = $e:expr ) (,) ... ;
      $es ...
    }
  } => {
    (function ( $v (,) ... ) {
     return mdo {
       core . ret ( function () { $ ( $v = $e ) (;) ... ; } ) ;
       act { $es ... } 
     }
    } () )
  }
  rule {
    { 
      while ( $test:expr ) { $b ... }
      $es ...
    }
  } => {
    mwhile { 
      act { $test } , 
      act { $b ... } , 
      act { $es ... } 
    }
  }
  rule {
    { 
      do {
        $b ...
      }
      while ( $test:expr );
      $es ...
    }
  } => {
    mdowhile {
      act { $b ... }, 
      act { $test }, 
      act { $es ... } 
    }
  }
  rule {
    {
      for ( var $v:ident in $o:expr ) $e:expr ;
      $es ...
    }
  } => {
    act {
      for ( var $v in $o ) { $e ; } 
      $es ...
    }
  }
  rule {
    {
      for ( var $v:ident in $o:expr ) {
        $e ...
      }
      $es ...
    }
  } => {
    act {
      var $v = undefined, keys = Object.keys( $o ) ;
      for (var j = 0; j < keys.length; j++) {
        $v = keys [j];
        $e ...
      }
      $es ...
    }
  }
  rule {
    {
      for ( $a ... ; $b:expr ; $c ... ) $e:expr;
      $es ...
    }
  } => {
    act {
      for ( $a ... ; $b ; $c ... ) {
        $e;
      }
      $es ...
    }
  }
  rule {
    {
      for ( $a ... ; $b:expr ; $c ... ) {
        $e ...
      }
      $es ...
    }
  } => {
    act {
      $a ... ;
      while ( $b ) {
        $e ... 
        $c ... 
      }
      $es ...
    }
  }
  rule {
    {
      if ( $test:expr ) { $l ... } else $r:expr ;
      $es ...
    }
  } => {
    act {
      if ( $test ) { $l ... } else { $r ; } 
      $es ...
    }
  }
  rule {
    {
      if ( $test:expr ) { $left ... } else { $right ... }
      $es ...
    }
  } => {
    mdo {
      mif { act { $test } , act { $left ... } , act { $right ... } };
      act { $es ... } ;
    }
  }
  rule {
    {
      if ( $test:expr ) { $l ... }
      $es ...
    }
  } => {
    act {
      if ( $test ) { $l ... } else {}
      $es ...
    }
  }
  rule {
    {
      if ( $test:expr ) $l:expr ; 
      $es ...
    }
  } => {
    act {
      if ( $test ) { $l } 
      $es ...
    }
  }
  rule {
    {
      if ( $test:expr ) $l:expr else { $r ... }
      $es ...
    }
  } => {
    act {
      if ( $test ) { $l } else { $r ... } 
      $es ...
    }
  }
  rule {
    {
      if ( $test:expr ) $l:expr else $r:expr ;
      $es ...
    }
  } => {
    act {
      if ( $test ) { $l ; } else { $r ; } 
      $es ...
    }
  }
  rule {
    {
      try {
        $b ...
      } catch ( $ex:ident ) {
        $h ...
      }
      $es ...
    }
  } => {
    mdo {
      mtry ( act { $b ... } ) catch ( $ex ) (act { $h ... } ) ;
      act { $es ... }
    }
  }
  rule {
    { 
      throw $e:expr; 
      $es ... 
    }
  } => {
    mdo {
      mfail ($e) ;
      act { $es ... } ;
    }
  }
  rule {
    { $e:expr ; $es ... }
  } => {
    mdo {
      mret ($e);
      act { $es ... };
    }
  }
}

// # Fork
// simple wrapper around the `act` macro that runs the built monad directly.
macro fork {
  rule {
    { $e ... }
  } => {
    ( act { $e ... } ) . run ();
  }
}

export mdo;
export act;
export fork;
