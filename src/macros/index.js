// -*- mode: js -*-

macro syntax_error {
  case { 
    _ $e:lit
  } => {
    throw new Error(#{$e}[0].token.value);
  }
}

macro _while_ {
  rule {
    ( $test:expr , $body:expr )
  } => {
    ( function loop () {
      return ( $test ) . bind ( function ( t ) {
        return t ? ( $body ) . bind (loop) : _cojs . undef ;
      } ) ;
    } () )
  }
}

macro _do_while_ {
  rule {
    ( $body:expr , $test:expr)
  } => {
    ( function loop () {
      return ( $body ) . bind ( function () {
        return ( $test ) . bind (function ( t ) {
          return t ? loop () : _cojs . undef ;
        } ) ;
      } );
    } () )
  }
}

macro _bind_ {
  rule {
    $v:ident = $e:expr in $b:expr
  } => {
    ( $e ) . bind ( function ( $v ) { return $b ; } );
  }
}
macro _if_ {
  rule {
    ( $t:expr, $l:expr )
  } => {
    _if_ ( $t, $l, _cojs.undef )
  }
  rule {
    ( $t:expr, $l:expr,  $r:expr )
  } => {
    ( $t ) . bind (function ( t ) { return t ? $l : $r ; } )
  }
}
macro action {
  // not supported keywords (return, break, continue)
  rule {
    { return $e:expr ; $es ... }
  } => {
    syntax_error 'return is not allowed in a fork block';
  }
  rule {
    { return ; $es ... }
  } => {
    action { 
      return undefined; 
      $es ...
    }
  }
  rule {
    { break $e:ident ; $es ... }
  } => {
    syntax_error 'break is not allowed in a fork block';
  }
  rule {
    { break ; $es ... }
  } => {
    action {
      break last ; 
      $es ...
    }
  }
  rule {
    { continue $e:ident ; $es ... }
  } => {
    syntax_error 'continue is not allowed in a fork block';
  }
  rule {
    { continue ; $es ... }
  } => {
    action {
      continue last ; 
      $es ...
    }
  }

  rule {
    { switch $es ... }
  } => {
    syntax_error 'switch is not allowed in a fork block';
  }
  // for (var name in object)
  rule {
    { for ( var $i:ident in $o ) $e:expr ; $es ... }
  } => {
    action { for ( var $i in $o ) { $e ; } $es ... }
  }
  rule {
    { for ( var $i:ident in $o ) { $e ... } $es ... }
  } => {
    action { 
        var $i = undefined, keys = Object.keys($o);
        for (var j = 0; j < keys.length; j++) {
          $i = keys[j];
          $e ...
        }
        $es ...
    }
  }
  // missing the first statement   
  rule {
    { for ( ; $t:expr ; $s:expr ) $es ... }
  } => {
    action { for (undefined ; $t ; $s ) $es ... }
  }
  // missing the second statement   
  rule {
    { for ( $i:expr ; ; $s:expr ) $es ... }
  } => {
    action { for ($i ; true ; $s ) $es ... }
  }
  rule {
    { for ( var $v:ident = $i:expr ; ; $s:expr ) $es ... }
  } => {
    action { for (var $v = $i ; true ; $s ) $es ... }
  }
  // missing the third statement   
  rule {
    { for ( $i:expr ; $t:expr ; ) $es ... }
  } => {
    action { for ($i ; $t ; undefined ) $es ... }
  }
  rule {
    { for ( var $v:ident = $i:expr ; $t:expr ; ) $es ... }
  } => {
    action { for (var $v = $i ; $t ; undefined ) $es ... }
  }
  // missing the first and second statements
  rule {
    { for ( ; ; $s:expr ) $es ... }
  } => {
    action { for (undefined ; true ; $s ) $es ... }
  }
  // missing the first and third statements
  rule {
    { for ( ; $t:expr ; ) $es ... }
  } => {
    action { for (undefined ; $t ; undefined ) $es ... }
  }
  // missing the second and third statements
  rule {
    { for ( $i:expr ; ; ) $es ... }
  } => {
    action { for ($i ; true ; undefined ) $es ... }
  }
  rule {
    { for ( var $v:ident = $i:expr ; ; ) $es ... }
  } => {
    action { for (var $v = $i ; true ; undefined ) $es ... }
  }
  // missing the 3 statements
  rule {
    { for ( ; ; ) $es ... }
  } => {
    action { for (undefined ; true ; undefined ) $es ... }
  }
  // for statement with all the components
  rule {
    { for ( $i:expr ; $t:expr ; $s:expr ) { $e ... } }
  } => {
    action {
      $i ;
      while ( $t ) { $s ; $e ... }
    }
  }
  rule {
    { for ( var $u:ident = $i ; $t:expr ; $s:expr ) { $e ... } }
  } => {
    action {
      var $u = $i;
      while ( $t ) { $s ; $e ... }
    }
  }
  rule {
    { for ( $i:expr ; $t:expr ; $s:expr ) { $e ... } $es ...}
  } => {
    ( action { for ( $i ; $t ; $s ) { $e ...} } ) 
      . bind ( function () { 
        return action { $es ... } ; 
      } )
  }
  rule {
    { for ( var $u:ident = $i ; $t:expr ; $s:expr ) { $e ... } $es ... }
  } => {
    ( action { for ( var $u = $i ; $t ; $s ) { $e ... } } ) 
      . bind ( function () { 
        return action { $es ... } ; 
      } )
  }
  rule {
    { for ( $i:expr ; $t:expr ; $s:expr ) $e:expr ; }
  } => {
    action {
      $i ;
      while ( $t ) { $s ; $e }
    }
  }
  rule {
    { for ( var $u:ident = $i:expr ; $t:expr ; $s:expr ) $e:expr ; }
  } => {
    action {
      var $u = $i;
      while ( $t ) { $s ; $e }
    }
  }
  rule {
    { for ( $i:expr ; $t:expr ; $s:expr ) $e:expr ; $es ...}
  } => {
    ( action { for ( $i ; $t ; $s ) $e ; } ) . bind ( function ()  { return action { $es ... } ; } )
  }
  rule {
    { for ( var $u:ident = $i:expr ; $t:expr ; $s:expr ) $e:expr ; $es ... }
  } => {
    ( action { for ( var $u = $i ; $t ; $s ) $e ; } ) . bind ( function () { return action { $es ... } ; } )
  }
  // throw
  rule {
    { throw $e:lit ; }
  } => {
    _cojs.fail ( $e ) 
  }
  rule {
    { throw $e:ident ; }
  } => {
    _cojs.fail ( $e ) 
  }
  rule {
    { throw $e:expr ; }
  } => {
    _cojs.failU ( $e ) 
  }
  rule {
    { throw $e:lit ; $es ... }
  } => {
    action { throw $e ; }
  }
  rule {
    { throw $e:ident ; $es ... }
  } => {
    action { throw $e ; }
  }
  rule {
    { throw $e:expr ; $es ... }
  } => {
    action { throw $e ; }
  }
  // try/catch/finally
  rule {
    { try { $b ... } finally { $f ... } }
  } => {
    ( action { $b ... } ) . anyhow ( action { $f ... } )
  }
  rule {
    { try { $b ... } catch ( $e:ident) { $c ... } }
  } => {
    ( action { $b ... } ) . error ( function ( $e ) { return action { $c ... } ; } )
  }
  rule {
    { try { $b ... } catch ( $e:ident) { $c ... } finally { $f ... } }
  } => {
    ( action { try { $b ... } catch ( $e ) { $c ... } } ) . anyhow ( action { $f ... } )
  }

  // while
  rule {
    { while ( $t:expr ) $b:expr ; }
  } => {
    _while_ ( action { $t }, action { $b } )
  }
  rule {
    { while ( $t:expr ) $b:expr ; $es ...}
  } => {
    ( action { while ( $t ) $b ; } ) . bind ( function () { return action { $es ... } ; } )
  }
  rule {
    { while ( $t:expr ) { $b ... } }
  } => {
    _while_ ( action { $t }, action { $b ... } )
  }
  rule {
    { while ( $t:expr ) { $b ... } $es ...}
  } => {
    ( action { while ( $t ) { $b ... } } ) . bind ( function () { return action { $es ... } ; } )
  }
  // do while 
  rule {
    { do { $b ... } while ( $t:expr ) }
  } => {
    _do_while_ ( action { $b ... } , action { $t } )
  }
  rule {
    { do { $b ... } while ( $t:expr ) ; }
  } => {
    action { do { $b ... } while ( $t ) }
  }

  rule {
    { do { $b ... } while ( $t:expr ) ; $es ... }
  } => {
    ( action { do { $b ... } while ( $t ) ; } ) . bind ( function () { return action { $es ... } ; } )
  }

  rule {
    { do $b:expr while ( $t:expr ) }
  } => {
    _do_while_ ( action { $b } , action { $t } )
  }
  rule {
    { do $b:expr while ( $t:expr ) ; }
  } => {
    action { do $b while ( $t ) }
  }
  rule {
    { do $b:expr while ( $t:expr ) ; $es ... }
  } => {
    ( action { do $b while ( $t ) ; } ) . bind ( function () { return action { $es ... } ; } )
  }
  // if
  rule {
    { if ( $t:expr ) { $l ... } else { $r ... } }
  } => {
    _if_ ( action { $t }, action { $l ... } , action { $r ... } )
  }
  rule {
    { if ( $t:expr ) { $l ... } else { $r ... } $es ... }
  } => {
    ( action { if ( $t ) { $l ... } else { $r ... }  } ) . bind ( function () { return action { $es ... } ; } )
  }

  rule {
    { if ( $t:expr ) { $l ... } else $r:expr ; }
  } => {
    _if_ ( action { $t } , action { $l ... } , action { $r } )
  }
  rule {
    { if ( $t:expr ) { $l ... } else $r:expr ; $es ... }
  } => {
    ( action { if ( $t ) { $l ... } else $r ; } ) . bind ( function () { return action { $es ... } ; } )
  }

  rule {
    { if ( $t:expr ) $l:expr ; else { $r ... } }
  } => {
    _if_ ( action { $t } , action { $l }, action { $r ... } )
  }
  rule {
    { if ( $t:expr ) $l:expr; else { $r ... } $es ... }
  } => {
    ( action { if ( $t ) $l ; else { $r ... } } ) . bind ( function () { return action { $es ... } ; } )
  }

  rule {
    { if ( $t:expr ) $l:expr ; else $r:expr ; }
  } => {
    _if_ ( action { $t }, action { $l } , action { $r } )
  }
  rule {
    { if ( $t:expr ) $l:expr; else $r:expr ; $es ... }
  } => {
    ( action { if ( $t ) $l ; else $r ; } ) . bind ( function () { return action { $es ... } ; } )
  }

  rule {
    { if ( $t:expr ) $l:expr ; }
  } => {
    _if_ ( action { $t } , action { $l } )
  }

  rule {
    { if ( $t:expr ) $l:expr ; $es ... }
  } => {
    ( action { if ( $t ) $l ; } ) . bind ( function () { return action { $es ... } ; } )
  }

  rule {
    { if ( $t:expr ) { $l ... } }
  } => {
    _if_ ( action { $t } , action { $l ... } )
  }
  rule {
    { if ( $t:expr ) { $l ... } $es ... }
  } => {
    ( action { if ( $t ) { $l ... } } ) . bind ( function () { return action { $es ... } ; } ) 
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
    ( action { $m ~> $c } ) . bind ( function () { return action { $es ... } ; } )
  }
  rule {
    { $m:lit ~> $c:expr ; $es ...}
  } => {
    ( action { $m ~> $c } ) . bind ( function () { return action { $es ... } ; } )
  }
  rule {
    { $m:ident ~> $c:ident ; $es ...}
  } => {
    ( action { $m ~> $c } ) . bind ( function () { return action { $es ... } ; } )
  }
  rule {
    { $m:ident ~> $c:expr ; $es ...}
  } => {
    ( action { $m ~> $c } ) . bind ( function () { return action { $es ... } ; } )
  }
  rule {
    { $m:expr ~> $c:ident ; $es ...}
  } => {
    ( action { $m ~> $c } ) . bind ( function () { return action { $es ... } ; } )
  }
  rule {
    { $m:expr ~> $c:expr ; $es ...}
  } => {
    ( action { $m ~> $c } ) . bind ( function () { return action { $es ... } ; } )
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
    ( action { $e } ) . bind ( function ( $v ) { return action { $es ... } ; } )
  }
  rule {
    { var $v:ident = $e:ident ; $es ... }
  } => {
    ( action { $e } ) . bind ( function ( $v ) { return action { $es ... } ; } )
  }
  rule {
    { var $v:ident = $e:expr ; $es ... }
  } => {
    ( action { $e } ) . bind ( function ( $v ) { return action { $es ... } ; } )
  }
  rule {
    { var $v:ident = $e , $es ... }
  } => {
    action { var $v = $e ; var $es ... }
  }
  rule {
    { var $v:ident ; $es ... }
  } => {
    action { var $v = undefined ; $es ... }
  }
  rule {
    { var $v:ident , $es ... }
  } => {
    action { var $v = undefined , $es ... }
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
    action { var e = $e, $v <~ e; $es ... }
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
     action { $e }
  }
  rule {
    { $e:ident ; }
  } => {
    action { $e }
  }
  rule {
    { $e:expr ; }
  } => {
    action { $e }
  }
  // single expression without semicolumn
  rule {
    { $e:lit }
  } => {
    _cojs . retU ( $e )
  }
  rule {
    { $e:ident }
  } => {
    _cojs . retU ( $e )
  }
  rule {
    { $e:expr }
  } => {
    _cojs . ret ( function () { return $e ; } )
  }
  // standard expression composition 
  rule {
    { $e:expr ; $es ... }
  } => {
    (action { $e } ) . bind ( function () { return action { $es ... } ; } )
  }
  // empty
  rule {
    {}
  } => {
    _cojs.undef
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
}

export action;
export fork;
export syntax_error;
