// This macro module is the core of the library, the exported macros
// (`go { }` and `go_eval { }` ) walk through the body and rewrite
// it according to the go semantic.
///

// core is a placeholder for the module
macro core {
  rule {
  } => {
    require ( './src/core' )
  }
}

// ### gojs
//
// Wraps a javascript expression in a monad.
// the js expression is wrapped in a function passed to  `_core_.ret'
// because it can handle correctly exceptions raised by the js code.
//
macro gojs {
  rule {
    ( $g ) { $e:expr }
  } => {
    $g . ret ( function () { return $e ; } )
  }
  rule {
    ( $g ) { $e:expr ; }
  } => {
    gojs ( $g ) { $e }
  }
  rule {
    ( $g ) { $e ... }
  } => {
    $g . ret ( function () { $e ... } )
  }
  rule {
    ( $g ) $e:expr
  } => {
    $g . ret ( function () { return $e ; } )
  }
}

// ### gofail
//
// Raise an exception
macro gofail {
  rule {
    ( $g ) $e:expr
  } => {
    $g . fail ( function () { return $e ; } )
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
// Syntactic sugar used to put 2 go_evalessions in sequence.
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
// the `go` macro is a wrapper arount `go_eval` that does more or less this:
//
//      go { $e ... } => ( go_eval { $e ... } ) . run()
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

macro go_eval {

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
    ( $g ) { 
      take $v:ident <- $x:expr or $y:expr or $chs ... ; 
      $gs ... 
    }
  } => {
    go_eval ( $g ) { 
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
    go_eval ( $g ) { 
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
      => go_eval ( $g ) { $gs ... }
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
    ( $ch ) . put ( $m ) goseq go_eval ( $g ) { $gs ... }
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
      return go_eval ( $g) { $t } . bind ( function ( k ) {
        return k ? go_eval ( $g ) { $b ... } . bind ( loop ) : go_eval ( $g ) { $gs ... } } )
    } () )
  }
  rule {
    ( $g ) {
      while ( $t:expr ) $e:expr ;
      $gs ...
    }
  } => {
    go_eval ( $g ) { while ( $t ) { $e } $gs ... }
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
      return go_eval ( $g ) { $b ... } goseq go_eval ( $g ) { $t } . bind ( function ( k ) {
        return k ? loop () : go_eval ( $g ) { $gs ... } ;
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
    gojs ( $g ) $e
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
    go_eval ( $g ) { $t } . bind ( function ( k ) { return k ? go_eval ( $g ) { $l ... } : go_eval ( $g ) { $r ... } ;  } )
  }

  rule {
    ( $g ) { 
      if ( $t:expr ) { 
        $e ... 
      } 
      $gs ... 
    }
  } => {
    go_eval ( $g ) { if ( $t ) { $e ... } else { undefined } $gs ... }
  }

  rule {
    ( $g ) { 
      if ( $t:expr ) $e ; 
      $gs ... 
    }
  } => {
    go_eval ( $g ) { if ( $t ) { $e ; } else { undefined } $gs ... }
  }

  rule {
    ( $g ) { 
      if ( $t:expr ) $e ... 
        else $f:expr 
      $gs ... }
  } => {
    go_eval ( $g ) { if ( $t ) $e ... else { $f } $gs ... }
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
    ( gotry go_eval ( $g ) { $e ... } catch ( $ex ) go_eval ( $g ) { $f ... } ) . bind ( function () { return go_eval ( $g ) { $gs ... } ; } )
  }
  // ## var's

  rule {
    ( $g ) { 
      var $( $a:ident = $e:expr ) (,) ...  ; 
      $gs ... 
    }
  } => {
    (function ($a (,) ...) {
      return  gojs ( $g ) { $($a = $e) (;) ... ; } goseq go_eval ( $g ) { $gs ... }
    } () )
  }

  rule {
    ( $g ) { 
      $v:ident = $e:expr ; 
      $gs ... 
    }
  } => {
    gojs ( $g ) { $v = $e; } goseq go_eval ( $g ) { $gs ... }
  }

  // ## general javascript expressions
  //
  // General javascript exceptions are evaluated as is.

  rule {
    ( $g ) { $e:expr }
  } => {
    go_eval ( $g ) { $e ; }
  }

  rule {
    ( $g ) { $e:expr ; }
  } => {
    gojs ( $g ) { $e }
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
    go_eval ( $g ) { $g0 } goseq go_eval ( $g ) { $gs ... }
  }

  rule {
    ( $g ) {}
  } => {
    $g . ret ( function () { return undefined ; } )
  }
}

// # Go macro
//
// This is the main way of building a goroutine, as told for go_eval,
// the main scope of `go` is to wrap `go_eval` that actually build a
// routine, and starting it.
//
//      go { $e ... } => ( go_eval { $e ... } ) . run()
//
// It provides some shortcuts for single statement expressions in
// which the expression could be not wrapped in curly braces
// i.e.
//
//      go while (test) { body } => go { while (test) { body } }
//
// #### value
//
// A go statement evaluates most probably to `"suspend"` if it is suspended 
// on one of the `put` or `take` operations.
// this is not useful very for the final user, but gives an insight on
// the way the engine works.

macro go {
  rule {
    { $e ... }
  } => {
    (function (core) {
      return  ( go_eval ( core ) { $e ... } ) . run ();
    }( core ) );
  }
  rule {
    while ( $t:expr ) { 
      $b ... 
    }
  } => {
    go { while ( $t ) { $b ... } }
  }

  rule {
    while ( $t:expr ) $b:expr;
  } => {
    go while ( $t ) { $b }
  }

  rule {
    do { 
      $b ... 
    } while ( $t:expr ) ;
  } => {
    go { do { $b ... } while ( $t ) ; }
  }

  rule {
    try { 
      $b ... 
    } catch ( $ex:ident) {
      $f ... 
    }
  } => {
    go { try { $b ... } catch ( $ex ) { $f ... } }
  }

  rule {
    put $m:expr -> $ch:expr
  } => {
    go { put $m -> $ch; }
  }
  rule {
    for ( $h ... ) { $b ... }
  } => {
    go { for ( $h ... ) { $b ... } }
  }
  rule {
    if ( $t:expr ) { 
      $l ... 
    } 
    else {
      $r ... 
    }
  } => {
    go { 
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
    go { 
      if ( $t ) { 
        $e ... 
      } 
    }
  }
  rule {
    if ( $t:expr ) $e ;
  } => {
    go { if ( $t ) $e ; }
  }
  rule {
    if ( $t:expr ) $e ... else $f:expr ;
  } => {
    go { if ( $t ) $e ... else $f ; }
  }
}

// # Export
//
// Exported macros are `go` and `go_eval`
// the former the default case, the latter can be useful in case
// the routine should be deferred, or used as a value.

export go;
export go_eval;
