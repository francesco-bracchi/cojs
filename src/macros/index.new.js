macro mret {
  rule {
    ret $b:expr
  } => {
    core . ret ( function () { return $b ; } )
  }
}

macro mbind {
  rule {
    mbind $v:ident = $m:expr; $e:expr
  } => {
    ( $m ) . bind ( function ( $v ) { return $e ; } ) 
  }
}

macro mseq {
  rule {
    mseq $m:expr; $n:expr
  } => {
    ( $m ) . then ( $n )
  }
}

macro mwhile {
  rule { 
    ( $test:expr ) { $b ... }
  } => {
    (function loop () { 
      return ( mret $test ) . bind ( function ( test ) {
        return test
          ? ( action { $b ... } ) . bind ( loop ) 
          : ( mret 'done' )
      } )
    } () )
  }
}

macro or {
  infix rule {
    $x:expr | $y:expr
  } => {
    ( $x ) . alt ( $y )
  }
} 

macro action {
  rule {
    {
      bind $v:ident = $e:expr ;
      $es ...
    }
  } => {
    ( mbind $v = $e ; action { $es ... } )
  } 

  rule {
    {
      val $v:ident <- $c:expr ;
      $es ...
    } 
  } => {
    action {
      bind $v = ( $c ) . take ();
      $es ...
    }
  }

 rule {
    {
      val $msg:expr -> $c:expr ;
      $es ...
    } 
  } => {
    (mseq ( $c ) . put ( $msg ) ; ( action { $es ... } ) )
  }

  
  rule {
    while ( $t:expr ) { $bs ... } $es ...
  } => {
    ( mseq ( mwhile $t { $bs ... } ; action { $es ... } )
  }

}


co {
  val x <- timeout (1000 'ciao') or c;
  val "ciao" -> c;
}
