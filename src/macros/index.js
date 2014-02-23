// This macro module is the core of the library, the exported macros
// (`go { }` and `action { }` ) walk through the body and rewrite
// it according to the go semantic.
///

// core is a placeholder for the module
macro core {
  rule {
  } => {
    require ( './src/core' )
  }
}

// ### gobind
//
// Syntactic sugar used to simplify the call to the `Monad.bind` method.
macro gobind {
  rule {
    $v:ident = $e:expr { $f:expr }
  } => {
    ( $e ) . bind ( function ( $v ) { return $f } )
  }

  rule {
    $v:ident = $e:expr => $f:expr
  } => {
    ( $e ) . bind ( function ( $v ) { return $f } )
  }
}

// ### goseq
//
// Syntactic sugar used to put 2 actionessions in sequence.
macro goseq {
  rule infix {
    $e:expr | $f:expr
  } => {
    gobind _ = $e => $f
  }
}

// ### gotry
//
// Synstactic sugar on try/catch.
// TBD: why not finally (currently no because of the lack of continue/break)
// example:
//
//     try <monad> catch (v) <monad>
macro gotry {
  rule {
    $e:expr catch ( $v:ident ) $f:expr
  } => {
    ( $e ) . alt ( function ( $v ) { return $f ; } )
  }
}

// # Go expression
// This is the principal macro, it takes a list of statements, that are
// javascript statements, augmented with a couple of new staments, namely
// `put` statement and `take` statement.
//
// a macro is by itself an expression, in particular an expression that
// once evaluated generates an object of type Monad.
//
// the `go` macro is a wrapper arount `action` that does more or less this:
//
//      go { $e ... } => ( action { $e ... } ) . run()
//
// that is, call the method run on the monad.
//
// The nice things (I think) on this gozilla method are (see README.md for
// more)
//
// 1. The various routines are not coupled, (i.e. a routine do not have to
//   know the identity of the other routine providing data) because we
//   are using channels, that are really data oriented synchronization
//   structures.
//
// 1. Exceptions flow trasparently through the callbacks
//
// 1. The queueing mechanism permits more general control structures than
//   the standard callback/promise/generatos
//
// 1. at the same time achieve the purpose of promises/generators of
//   keeping the logic in a single place instead of scattered around.
///

macro action {

  // ## take statement
  //
  //     take val <- channel;
  //
  // when encountered, this statement tries to get a value from the channel
  // `channel`, and put it in a newly created variable val. then continue
  //
  // IF the channel is empty, the routine suspend itself, and will be resumed
  // when the channel will be able to provide new content.
  //
  // val should be an identifier, while channel any expression.
  //
  // The underlying logic is actually handled by the object `channel`.
  rule {
    { $e ... }
  } => {
    (function (core) {
      return  ( action ( core ) { $e ... } );
    }( core ) )
  }
  rule {
    ( $g ) { 
      take $v:ident <- $x:expr or $y:expr or $chs ... ; 
      $gs ... 
    }
  } => {
    action ( $g ) { 
      take $v <- ( $x ) . alt ( $y ) or $chs ... ; 
      $gs ... 
    }
  }

  rule {
    ( $g ) { 
      take $v:ident <- $x:expr or $y:expr ; 
      $gs ... 
    }
  } => {
    action ( $g ) { 
      take $v <- ( $x ) . alt ( $y ) ; 
      $gs ... 
    }
  }

  rule {
    ( $g ) {
      take $v:ident <- $ch:expr ; 
      $gs ... 
    }
  } => {
    gobind $v = $ch . take () 
      => action ( $g ) { $gs ... }
  }

  // ## put statement
  //
  //     put message -> channel;
  //
  // It's the counterpart of `take`. When met tries to put a message in the
  // channel. If the channel is buffered it can continue unless the buffer is
  // full, otherwise it suspend itself.
  //
  // If the channel is unbuffered, the current thread is suspended. if some
  // other threads are waiting for data, one of these is resumed, and once
  // completed the current thread is resumed as well.

  rule {
    ( $g ) { 
      put $m:expr -> $ch:expr; 
    }
  } => {
    ( $ch ) . put ( $m )
  }

  rule {
    ( $g ) { 
      put $m:expr -> $ch:expr;
      $gs ... 
    }
  } => {
    ( $ch ) . put ( $m ) . then ( action ( $g ) { $gs ... } )
  }

  // ## while statement
  //
  //     while ($test) { $body ... }
  //
  // This statement tries to mimic javascript `while` loop.
  // Since the body of the loop can obviously contain `take` or `put` statements,
  // it can't be implemented with javascript while, because these can't be resumed.
  // the solution is to use a recursive function.
  //
  // The fact that it doesn't go in an infinite loop depends on the fact that
  // the monad we are using provide a trampoline mechanism.

  rule {
    ( $g ) {
      while ( $t:expr ) { $b ... }
      $gs ...
    }
  } => {
    ( function loop () {
      return action ( $g) { $t } . bind ( function ( k ) {
        return k ? action ( $g ) { $b ... } . bind ( loop ) : action ( $g ) { $gs ... } } )
    } () )
  }
  rule {
    ( $g ) {
      while ( $t:expr ) $e:expr ;
      $gs ...
    }
  } => {
    action ( $g ) { while ( $t ) { $e } $gs ... }
  }

  // ## do while statement
  //
  //     do { $body } while ($test) ;
  //
  // this is pretty similar to the while loop, except that runs the body
  // at least once.

  rule {
    ( $g ) {
      do { $b ... } while ( $t:expr ) ;
      $gs ...
    }
  } => {
    ( function loop () {
      return action ( $g ) { $b ... } goseq action ( $g ) { $t } . bind ( function ( k ) {
        return k ? loop () : action ( $g ) { $gs ... } ;
      } ) ; } () )
  }

  // ## return statement
  //
  // return statement in a routine does nothing. it evaluates the expression
  // and nothing more, continue in any case.
  // TODO: make this statement raise an error.

  rule {
    ( $g ) { return $e:expr ; }
  } => {
    $g . ret (function () { return $e ; } )
  }

  // ## if statement
  //
  // As expected evaluates the test argument, if it is true, goes on the left,
  // right otherwise.

  rule {
    ( $g ) { 
      if ( $t:expr ) { 
        $l ... 
      } else { 
        $r ... 
      } 
      $gs ... 
    }
  } => {
    action ( $g ) { $t } . bind ( function ( k ) { return k ? action ( $g ) { $l ... } : action ( $g ) { $r ... } ;  } )
  }

  rule {
    ( $g ) { 
      if ( $t:expr ) { 
        $e ... 
      } 
      $gs ... 
    }
  } => {
    action ( $g ) { if ( $t ) { $e ... } else { undefined } $gs ... }
  }

  rule {
    ( $g ) { 
      if ( $t:expr ) $e ; 
      $gs ... 
    }
  } => {
    action ( $g ) { if ( $t ) { $e ; } else { undefined } $gs ... }
  }

  rule {
    ( $g ) { 
      if ( $t:expr ) $e ... 
        else $f:expr 
      $gs ... }
  } => {
    action ( $g ) { if ( $t ) $e ... else { $f } $gs ... }
  }

  // ## try/catch statement
  //
  // This is the try catch statement ;)
  //
  // The nice thing about this is that when a routine is suspended because of
  // a channel op, when resumed, and the continuation raises an excpetion,
  // this is raised to the external point.

  rule {
    ( $g ) { 
      try { $e ... } 
      catch ( $ex:ident ) { 
        $f ... 
      }
      $gs ... 
    }
  } => {
    ( gotry action ( $g ) { $e ... } catch ( $ex ) action ( $g ) { $f ... } ) . bind ( function () { return action ( $g ) { $gs ... } ; } )
  }
  // ## var's

  rule {
    ( $g ) { 
      var $( $a:ident = $e:expr ) (,) ...  ; 
      $gs ... 
    }
  } => {
    (function ($a (,) ...) {
      return $g . ret (function () { $($a = $e) (;) ... }) . then ( action ( $g ) { $gs ... } ) ;
    } () )
  }

  rule {
    ( $g ) { 
      $v:ident = $e:expr ; 
      $gs ... 
    }
  } => {
    $g . ret ( function () { $v = $e ; } ) . then ( action ( $g ) { $gs ... } )
  }

  // ## general javascript expressions
  //
  // General javascript exceptions are evaluated as is.

  rule {
    ( $g ) { $e:expr }
  } => {
    action ( $g ) { $e ; }
  }

  rule {
    ( $g ) { $e:expr ; }
  } => {
    $g . ret ( function () { return $e ; } )
  }
  
  // ## composition rule
  //
  // Main Composition rule: one expression, then the other :)

  rule {
    ( $g ) { 
      $g0:expr ; 
      $gs ... 
    }
  } => {
    action ( $g ) { $g0 } goseq action ( $g ) { $gs ... }
  }

  rule {
    ( $g ) {}
  } => {
    $g . ret ( function () { return undefined ; } )
  }
}

// # Fork macro
//
// This is the main way of building a goroutine, as told for action,
// the main scope of `go` is to wrap `action` that actually build a
// routine, and starting it.
//
//      fork { $e ... } => ( action { $e ... } ) . run()
//
// It provides some shortcuts for single statement expressions in
// which the expression could be not wrapped in curly braces
// i.e.
//
//      fork while (test) { body } => fork { while (test) { body } }
//
// #### value
//
// A fork statement evaluates most probably to `"suspend"` if it is suspended 
// on one of the `put` or `take` operations.
// this is not useful very for the final user, but gives an insight on
// the way the engine works.

macro fork {
  rule {
    { $e ... }
  } => {
    ( action { $e ... } ) . run ();
  }
  rule {
    while ( $t:expr ) { 
      $b ... 
    }
  } => {
    fork { while ( $t ) { $b ... } }
  }

  rule {
    while ( $t:expr ) $b:expr;
  } => {
    fork while ( $t ) { $b }
  }

  rule {
    do { 
      $b ... 
    } while ( $t:expr ) ;
  } => {
    fork { do { $b ... } while ( $t ) ; }
  }

  rule {
    try { 
      $b ... 
    } catch ( $ex:ident) {
      $f ... 
    }
  } => {
    fork { try { $b ... } catch ( $ex ) { $f ... } }
  }

  rule {
    put $m:expr -> $ch:expr
  } => {
    fork { put $m -> $ch; }
  }
  rule {
    for ( $h ... ) { $b ... }
  } => {
    fork { for ( $h ... ) { $b ... } }
  }
  rule {
    if ( $t:expr ) { 
      $l ... 
    } 
    else {
      $r ... 
    }
  } => {
    fork { 
      if ( $t ) { 
        $l ... 
      } else { 
        $r ... 
      } 
    }
  }
  rule {
    if ( $t:expr ) {
      $e ... 
    }
  } => {
    fork { 
      if ( $t ) { 
        $e ... 
      } 
    }
  }
  rule {
    if ( $t:expr ) $e ;
  } => {
    fork { if ( $t ) $e ; }
  }
  rule {
    if ( $t:expr ) $e ... else $f:expr ;
  } => {
    fork { if ( $t ) $e ... else $f ; }
  }
}

// # Export
//
// Exported macros are `fork` and `action`
// the former the default case, the latter can be useful in case
// the routine should be deferred, or used as a value.

export fork;
export action;
