// -*- mode: js -*-

macro action {
  // while
  rule {
    { while ( $t:expr ) $b:expr ; }
  } => {
    _cojs. while_ ( action { $t } , action { $b } )
  }
  rule {
    { while ( $t:expr ) $b:expr ; $es ...}
  } => {
    _cojs.while_ ( action { $t }, action { $b } ) . then ( action { $es ... } )
  }
  rule {
    { while ( $t:expr ) { $b ... } }
  } => {
    _cojs.while_ ( action { $t }, action { $b ... } )
  }
  rule {
    { while ( $t:expr ) { $b ... } $es ...}
  } => {
    _cojs.while_ ( action { $t }, action { $b ... } ) . then ( action { $es ... } )
  }
  // do while 
  rule {
    { do { $b ... } while ( $t:expr ) ; }
  } => {
    _cojs.do_ ( action { $b ... } , action { $t } )
  }

  rule {
    { do { $b ... } while ( $t:expr ) ; $es ... }
  } => {
    _cojs.do_ ( action { $b ... } , action { $t } ) . then ( action { $es ... } )
  }

  rule {
    { do $b:expr while ( $t:expr ) ; }
  } => {
    _cojs.do_ ( action { $b } , action { $t } )
  }
  rule {
    { do $b:expr while ( $t:expr ) ; $es ... }
  } => {
    _cojs.do_ ( action { $b } , action { $t } ) . then ( action { $es ... } )
  }
  // if
  rule {
    { if ( $t:expr ) { $l ... } else { $r ... } }
  } => {
    _cojs.if_ ( action ( $t ) , action { $l ... } , action { $r ... } )
  }
  rule {
    { if ( $t:expr ) { $l ... } else { $r ... } $es ... }
  } => {
    action { if ( $t ) { $l ... } else { $r ... }  } . then ( action { $es ... } )
  }

  rule {
    { if ( $t:expr ) { $l ... } else $r:expr ; }
  } => {
    _cojs.if_ ( action ( $t ) , action { $l ... } , action $r  )
  }
  rule {
    { if ( $t:expr ) { $l ... } else $r:expr ; $es ... }
  } => {
    action { if ( $t ) { $l ... } else $r ; } . then ( action { $es ... } )
  }

  rule {
    { if ( $t:expr ) $l:expr ; else { $r ... } }
  } => {
    _cojs.if_ ( action ( $t ) , action ( $l ) , action { $r ... }  )
  }
  rule {
    { if ( $t:expr ) $l:expr; else { $r ... } $es ... }
  } => {
    action { if ( $t ) $l ; else { $r ... }  } . then ( action { $es ... } )
  }

  rule {
    { if ( $t:expr ) $l:expr ; else $r:expr ; }
  } => {
    _cojs.if_ ( action ( $t ) , action ( $l ) , action $r  )
  }
  rule {
    { if ( $t:expr ) $l:expr; else $r:expr ; $es ... }
  } => {
    action { if ( $t ) $l ; else $r ;  } . then ( action { $es ... } )
  }

  rule {
    { if ( $t:expr ) $l:expr ; }
  } => {
    _cojs.if_ ( action ( $t ) , action ( $l )  )
  }

  rule {
    { if ( $t:expr ) $l:expr ; $es ... }
  } => {
    ( action { if ( $t ) $l ; } ) . then ( action { $es ... } )
  }

  rule {
    { if ( $t:expr ) { $l ... } }
  } => {
    _cojs.if_ ( action ( $t ) , action { $l ... }  )
  }
  rule {
    { if ( $t:expr ) { $l ... } $es ... }
  } => {
    action { if ( $t ) { $l ... } }. then ( action { $es ... } ) 
  }
  
  // ## Put
  // this is one of the 2 new syntactic operations added, (the other is **Take**)
  // it is in the form
  // 
  //     message ~> channel;
  // 
  // it is used to send a message to a channel.
  // This section contains lot of repetitions for `:lit` and `:ident` because 
  // these can be optimized without boxing them in a `_cojs.ret` statement.

  // single `put` with column
  rule {
    { $m:lit ~> $c:ident ; }
  } => {
    action { $m ~> $c }
  }
  rule {
    { $m:lit ~> $c:expr ; }
  } => {
    action { $m ~> $c }
  }
  rule {
    { $m:ident ~> $c:ident ; }
  } => {
    action { $m ~> $c }
  }
  rule {
    { $m:ident ~> $c:expr ; }
  } => {
    action { $m ~> $c }
  }
  rule {
    { $m:expr ~> $c:ident ; }
  } => {
    action { $m ~> $c }
  }
  rule {
    { $m:expr ~> $c:expr ; }
  } => {
    action { $m ~> $c }
  }

  // `put` with something afterward
  rule {
    { $m:lit ~> $c:ident ; $es ... }
  } => {
    action { $m ~> $c } . then ( action { $es ... } )
  }
  rule {
    { $m:lit ~> $c:expr ; $es ...}
  } => {
    action { $m ~> $c } . then ( action { $es ... } )
  }
  rule {
    { $m:ident ~> $c:ident ; $es ...}
  } => {
    action { $m ~> $c } . then ( action { $es ... } )
  }
  rule {
    { $m:ident ~> $c:expr ; $es ...}
  } => {
    action { $m ~> $c } . then ( action { $es ... } )
  }
  rule {
    { $m:expr ~> $c:ident ; $es ...}
  } => {
    action { $m ~> $c } . then ( action { $es ... } )
  }
  rule {
    { $m:expr ~> $c:expr ; $es ...}
  } => {
    action { $m ~> $c } . then ( action { $es ... } )
  }

  // single `put` expression without semicolumn
  rule {
    { $m:lit ~> $c:ident }
  } => {
    ( $c ) . put ( $m )
  }
  rule {
    { $m:ident ~> $c:ident }
  } => {
    ( $c ) . put ( $m )
  }
  rule {
    { $m:expr ~> $c:ident }
  } => {
    action {
      var m = $m;
      m ~> $c
    }
  }
  rule {
    { $m:lit ~> $c:expr }
  } => {
    action {
      var c = $c;
      $m ~> c
    }
  }
  rule {
    { $m:ident ~> $c:expr }
  } => {
    action {
      var c = $c;
      $m ~> c
    }
  }
  rule {
    { $m:expr ~> $c:expr }
  } => {
    action {
      var m = $m, 
          c = $c;
      m ~> c
    }
  }

  // Variable declaration
  // the variable context is no more precedent to the 
  // variable declaration. therefore this code doesn't correspond to the 
  // javascript semantic.
  // 
  //     var b = function () { return a; };
  //     var a = 42;
  //     var c = b (); 
  //     // c is undefined
  //
  rule {
    { var $v:ident = $e:lit ; $es ... }
  } => {
    ( action $e ) . bind ( function ( $v ) { return action { $es ... } ; } )
  }
  rule {
    { var $v:ident = $e:ident ; $es ... }
  } => {
    ( action $e ) . bind ( function ( $v ) { return action { $es ... } ; } )
  }
  rule {
    { var $v:ident = $e:expr ; $es ... }
  } => {
    ( action $e ) . bind ( function ( $v ) { return action { $es ... } ; } )
  }
  rule {
    { var $v:ident = $e , $es ... }
  } => {
    action { var $v = $e ; var $es ... }
  }
 
  // ## Take
  // 
  // This is the second operator used to estract a value from a channel, 
  // it can be used in a var context (i.e. creating a new variable),
  // or in a plain expression
  // 
  //     var message <~ channel;
  // 
  //     message <~ channel;
  // 
  // btw the var declaration can be intermixed with normal declaration
  // separated by commas i.e.
  // 
  //     var a <~ ch0, 
  //         b = foo (), 
  //         c <~ ch1;
  //
  rule {
    { var $v:ident <~ $e:ident ; $es ... }
  } => {
    $e . take () . bind ( function ( $v ) { return action { $es ... } ; } )
  }
  rule {
    { var $v:ident <~ $e:expr ; $es ... }
  } => {
    action { var e = $e, v <~ e; $es ... }
  }
  rule {
    { var $v:ident <~ $e:ident , $es ... }
  } => {
    action { var $v <~$e ; var $es ... }
  }
  rule {
    { var $v:ident <~ $e:expr , $es ... }
  } => {
    action { var $v <~ $e ; var $es ... }
  }
  rule {
    { $v:ident <~ $e:ident ; $es ... }
  } => {
    action {
      var v <~ $e;
      $v = v;
      $es ...
    }
  } 
  rule {
    { $v:ident <~ $e:expr ; $es ... }
  } => {
    action {
      var v <~ $e;
      $v = v;
      $es ...
    }
  } 

  // single expression that ends with ;
  rule {
    { $e:lit ; }
  } => {
    action $e
  }
  rule {
    { $e:ident ; }
  } => {
    action $e
  }
  rule {
    { $e:expr ; }
  } => {
    action $e
  }

  // standard expression composition 
  rule {
    { $e:expr ; $es ... }
  } => {
    (action $e ) . then ( action { $es ... } )
  }
  // empty
  rule {
    {}
  } => {
    _cojs.undef
  }
  // single expression without semicolumn
  rule {
    { $e:lit }
  } => {
    // _cojs.retU ( $e )
    action $e
  }
  rule {
    { $e:ident }
  } => {
    // _cojs.retU ( $e )
    action $e
  }
  rule {
    { $e:expr }
  } => {
    // _cojs.ret ( function () { return $e } );
    action $e
  }
  // single expression without the {} brackets
  rule {
    $e:lit
  } => {
    _cojs.retU($e)
  }
  rule {
    $e:ident
  } => {
    _cojs.retU($e)
  }
  rule {
    $e:expr
  } => {
    _cojs.ret( function () { return $e ; } )
  }
}

// # Fork
// simple wrapper around the `action` macro that runs the built monad directly.
macro fork {
  rule {
    { $e ... }
  } => {
    ( action { $e ... } ) . run ();
  }
  rule {
    e:expr
  } => {
    ( action $e ) . run ();
  }
}

export action;
export fork;
