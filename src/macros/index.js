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
    core . ret ( function () { return $b ; } )
  }
}

macro mbind {
  rule {
    ( $v:ident, $m:expr,  $e:expr)
  } => {
    ( $m ) . bind ( function ( $v ) { return $e ; } ) 
  }
}

macro mseq {
  rule {
    ( $m:expr ,  $n:expr )
  } => {
    ( $m ) . then ( $n )
  }
}

// macro mwhile {
//   rule {
//     $test $body $rest
//   } => {
//     (function loop () { 
//       return ( $test ) . bind ( function ( test ) {
//         return test ? ( $body ) . bind ( loop ) : ( $rest ) ;
//       } )
//     } () )
//   }
// }

// macro mdowhile {
//   rule {
//     $body $test $rest
//   } => {
//     ( function loop ( test ) {
//       return test ? ( $body ) . then ( ( $test ) . bind ( loop ) ) : ( $rest )
//     } (true) )
//   }
// }

macro action {
  rule {
    { $e:expr }
  } => {
    action { $e ; }
  }
  rule {
    { $e:expr ; }
  } => {
    mret ( $e )
  }
  rule {
    {}
  } => {
    mret ( undefined )
  }
  rule {
    { do! $v:ident = $e:expr ; $es ... }
  } => {
    mbind (e, mret( $e ), mbind ($v, e, action { $es ... } ) )
  }
  rule {
    { do! $e:expr ; $es ... }
  } => {
    mbind (e, mret ( $e ), mseq (e, action { $es ... } ) )
  }
  rule {
    { $e:expr ; $es ... }
  } => {
    mseq ( mret ( $e ) , action { $es ... } )
  }

  rule {
    { recv $v:ident = $c:expr ; $es ... }
  } => {
    action {
      do! $v = ( $c ) . take ();
      $es ...
    }
  }

  rule {
    { $m:expr ! $c:expr ; $es ... }
  } => {
    action {
      do! $c . put ( $m );
      $es ...
    }
  }
  // rule {
  //   {
  //     take $v:ident <- $c:expr or $d:expr ;
  //     $es ...
  //   } 
  // } => {
  //   action {
  //     take $v:ident <- $c . alt ( $d )
  //     $es ...
  //   }
  // }

  // rule {
  //   {
  //     take $v:ident <- $c:expr or $d:expr or $e ... ;
  //     $es ...
  //   } 
  // } => {
  //   action {
  //     take $v:ident <- ( $c ) . alt ( $d ) or $e ... ;
  //     $es ...
  //   }
  // }
  
  // rule {
  //   {
  //     take $v:ident <- $c:expr ;
  //     $es ...
  //   } 
  // } => {
  //   action {
  //     bind $v = ( ( $c ) . take () ) ;
  //     $es ...
  //   }
  // }

  // rule {
  //   {
  //     put $msg:expr -> $c:expr ;
  //     $es ...
  //   } 
  // } => {
  //   ( mseq ( ( $c ) . put ( $msg ) ) ( action { $es ... } ) )
  // }
  
  // rule {
  //   while ( $t:expr ) { $bs ... } $es ...
  // } => {
  //   ( mwhile ( action { $t } ) ( action { $bs ... } ) ( action { $bs ... } ) )
  // }
  
  // rule {
  //   do { $bs ... } while ( $t ) ; $es ...
  // } => {
  //   ( mdo ( action { $bs ... } ) while ( action { $t } ) ( action { $es ... } ) )
  // }
}

macro fork {
  rule {
    { $e ... }
  } => {
    ( action { $e ... } ) . run ();
  }
}

export action;
export fork;
