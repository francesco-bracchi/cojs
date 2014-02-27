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

macro mif {
  rule {
    { $test:expr , $left:expr , $right:expr }
  } => {
    ( $test ) . bind (function ( test ) {
      return test ? ( $left ) : ( $right ) ;
    } )
  }
}

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
      act { $es ... } 
    }
  }
  rule {
    {
      var $v:ident = $e:expr ;
      $es ...
    }
  } => {
    act {
      ( var $v = $e ) ;
      act { $es ... } 
    }
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
      if ( $test:expr ) { $left ... } else { $right ... }
      $es ...
    }
  } => {
    mdo {
      mif { act { $test } , act { $left ... } , act { $right ... } };
      act { $es ... }
    }
  }
  rule {
    {
      if ( $test:expr ) { $l ... }
      $es ...
    }
  } => {
    act {
      if ( $test ) { $l } else {}
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
      if ( $test:expr ) { $l ... } else $r:expr
      $es ...
    }
  } => {
    act {
      if ( $test ) { $l ... } else { $r } 
      $es ...
    }
  }
  rule {
    {
      if ( $test:expr ) $l:expr else $r:expr
      $es ...
    }
  } => {
    act {
      if ( $test ) { $l } else { $r } 
      $es ...
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
