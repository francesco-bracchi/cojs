
macro action {

  // if
  rule {
    { if ( $t:expr ) { $l ... } else { $r ... } }
  } => {
    core.if_ ( action ( $t ) , action { $l ... } , action { $r ... } )
  }
  rule {
    { if ( $t:expr ) { $l ... } else { $r ... } $es ... }
  } => {
    action { if ( $t ) { $l ... } else { $r ... }  } . then ( action { $es ... } )
  }

  rule {
    { if ( $t:expr ) { $l ... } else $r:expr ; }
  } => {
    core.if_ ( action ( $t ) , action { $l ... } , action $r  )
  }
  rule {
    { if ( $t:expr ) { $l ... } else $r:expr ; $es ... }
  } => {
    action { if ( $t ) { $l ... } else $r ; } . then ( action { $es ... } )
  }

  rule {
    { if ( $t:expr ) $l:expr ; else { $r ... } }
  } => {
    core.if_ ( action ( $t ) , action ( $l ) , action { $r ... }  )
  }
  rule {
    { if ( $t:expr ) $l:expr; else { $r ... } $es ... }
  } => {
    action { if ( $t ) $l ; else { $r ... }  } . then ( action { $es ... } )
  }

  rule {
    { if ( $t:expr ) $l:expr ; else $r:expr ; }
  } => {
    core.if_ ( action ( $t ) , action ( $l ) , action $r  )
  }
  rule {
    { if ( $t:expr ) $l:expr; else $r:expr ; $es ... }
  } => {
    action { if ( $t ) $l ; else $r ;  } . then ( action { $es ... } )
  }

  rule {
    { if ( $t:expr ) $l:expr ; }
  } => {
    core.if_ ( action ( $t ) , action ( $l )  )
  }

  rule {
    { if ( $t:expr ) $l:expr ; $es ... }
  } => {
    ( action { if ( $t ) $l ; } ) . then ( action { $es ... } )
  }

  rule {
    { if ( $t:expr ) { $l ... } }
  } => {
    core.if_ ( action ( $t ) , action { $l ... }  )
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
  // these can be optimized without boxing them in a `core.ret` statement.

  // simple put with column
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

  // put with something afterward
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

  // simple put expression
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
    core.undef
  }
  // single line 
  rule {
    { $e:lit }
  } => {
    action $e;
  }
  rule {
    { $e:ident }
  } => {
    action $e;
  }
  rule {
    { $e:expr }
  } => {
    action $e;
  }
  // basic expression
  rule {
    $e:lit
  } => {
    core.retU($e)
  }
  rule {
    $e:ident
  } => {
    core.retU($e)
  }
  rule {
    $e:expr
  } => {
    core.ret( function () { return $e ; } )
  }
}

export action;
