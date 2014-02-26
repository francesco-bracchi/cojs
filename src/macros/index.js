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
    ( $test:expr, $body:expr, $rest:expr )
  } => {
    ( function loop () {
      return ( $test ) . bind ( function ( t ) {
        return t ? ( $body ) . bind (loop) : ( $rest ) } );
    } () )
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
    mdo { mret ($e) }
  }
  rule {
    { $e:expr ; }
  } => {
    mdo { mret ($e) ; }
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
      while ( $test:expr ) { $b ... }
      $es ...
    }
  } => {
    mwhile ( act { $test } , 
             act { $b ... }, 
             act { $es ... } )
    // core.whileLoop ( act { $test }, 
    //                  act { $b ... },
    //                  act { $es ... } )
  }
  // rule {
  //   while ( $test:expr ) $b:expr ;
  //   $es ...
  // } => {
  //   act {
  //     while ( $test ) { $b ; }
  //     $es ...
  //   }
  // }
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
