/**
 * # Macro module
 *
 * This macro module is the core of the library, the exported macros
 * (`go { }` and `goexpr { }` ) walk through the body and rewrite
 * it according to the go semantic.
 */

macro core {
  rule {
  } => {
    require ( './src/core' )
  }
}

/**
 * ### gojs
 *
 * Wraps a javascript expression in a monad.
 * the js expression is wrapped in a function passed to  `_core_.ret'
 * because it can handle correctly exceptions raised by the js code.
 */
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

/**
 * ### gofail
 *
 * Raise an exception
 */
macro gofail {
  rule {
    ( $g ) $e:expr
  } => {
    $g . fail ( function () { return $e ; } )
  }
}

/**
 * ### gobind
 *
 * Syntactic sugar used to simplify the call to the `Monad.bind` method.
 */
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

/**
 * ### goseq
 *
 * Syntactic sugar used to put 2 goexpressions in sequence.
 */
macro goseq {
  rule infix {
    $e:expr | $f:expr
  } => {
    gobind _ = $e => $f
  }
}

/**
 * ## gotry
 *
 * Synstactic sugar on try/catch.
 * TBD: why not finally (currently no because of the lack of continue/break)
 * example:
 *
 *     try <monad> catch (v) <monad>
 */
macro gotry {
  rule {
    $e:expr catch ( $v:ident ) $f:expr
  } => {
    ( $e ) . alt ( function ( $v ) { return $f ; } )
  }
}

/**
 * This is the principal macro, it takes a list of statements, that are
 * javascript statements, augmented with a couple of new staments, namely
 * `send` statement and `recv` statement.
 *
 * a macro is by itself an expression, in particular an expression that
 * once evaluated generates an object of type Monad.
 *
 * the `go` macro is a wrapper arount `goexpr` that does more or less this:
 *
 *      go { $e ... } => ( goexpr { $e ... } ) . run()
 *
 * that is, call the method run on the monad.
 *
 * The nice things (I think) on this gozilla method are (see README.md for
 * more)
 *
 * 1. The various routines are not coupled, (i.e. a routine do not have to
 *   know the identity of the other routine providing data) because we
 *   are using channels, that are really data oriented synchronization
 *   structures.
 *
 * 1. Exceptions flow trasparently through the callbacks
 *
 * 1. The queueing mechanism permits more general control structures than
 *   the standard callback/promise/generatos
 *
 * 1. at the same time achieve the purpose of promises/generators of
 *   keeping the logic in a single place instead of scattered around.
 */

macro goexpr {
  /**
   * ## Recv statement
   *
   *     recv val <- channel;
   *
   * when encountered, this statement tries to get a value from the channel
   * `channel`, and put it in a newly created variable val. then continue
   *
   * IF the channel is empty, the routine suspend itself, and will be resumed
   * when the channel will be able to provide new content.
   *
   * val should be an identifier, while channel any expression.
   *
   * The underlying logic is actually handled by the object `channel`.
   */

  rule {
    ( $g ) { recv $v:ident <- $x:expr or $y:expr or $chs ... ; $gs ... }
  } => {
    goexpr ( $g ) { recv $v <- ( $x ) . alt ( $y ) or $chs ... ; $gs ... }
  }

  rule {
    ( $g ) { recv $v:ident <- $x:expr or $y:expr ; $gs ... }
  } => {
    goexpr ( $g ) { recv $v <- ( $x ) . alt ( $y ) ; $gs ... }
  }

  rule {
    ( $g ) { recv $v:ident <- $ch:expr ; $gs ... }
  } => {
    gobind $v = $ch . recv () => goexpr ( $g ) { $gs ... }
  }
  /**
   * ## Send statement
   *
   *     send message -> channel;
   *
   * It's the counterpart of `recv`. When met tries to put a message in the
   * channel. If the channel is buffered it can continue unless the buffer is
   * full, otherwise it suspend itself.
   *
   * If the channel is unbuffered, the current thread is suspended. if some
   * other threads are waiting for data, one of these is resumed, and once
   * completed the current thread is resumed as well.
   */

  rule {
    ( $g ) { send $m:expr -> $ch:expr; }
  } => {
    ( $ch ) . send ( $m )
  }

  rule {
    ( $g ) { send $m:expr -> $ch:expr; $gs ... }
  } => {
    ( $ch ) . send ( $m ) goseq goexpr ( $g ) { $gs ... }
  }

  /**
   * ## While statement
   *
   *     while ($test) { $body ... }
   *
   * This statement tries to mimic javascript `while` loop.
   * Since the body of the loop can obviously contain `recv` or `send` statements,
   * it can't be implemented with javascript while, because these can't be resumed.
   * the solution is to use a recursive function.
   *
   * The fact that it doesn't go in an infinite loop depends on the fact that
   * the monad we are using provide a trampoline mechanism.
   */
  rule {
    ( $g ) {
      while ( $t:expr ) { $b ... }
      $gs ...
    }
  } => {
    ( function loop () {
      return goexpr ( $g) { $t } . bind ( function ( k ) {
        return k ? goexpr ( $g ) { $b ... } . bind ( loop ) : goexpr ( $g ) { $gs ... } } )
    } () )
  }
  rule {
    ( $g ) {
      while ( $t:expr ) $e:expr ;
      $gs ...
    }
  } => {
    goexpr ( $g ) { while ( $t ) { $e } $gs ... }
  }
  /**
   * ## do while statement
   *
   *     do { $body } while ($test) ;
   *
   * this is pretty similar to the while loop, except that runs the body
   * at least once.
   */
  rule {
    ( $g ) {
      do { $b ... } while ( $t:expr ) ;
      $gs ...
    }
  } => {
    ( function loop () {
      return goexpr ( $g ) { $b ... } goseq goexpr ( $g ) { $t } . bind ( function ( k ) {
        return k ? loop () : goexpr ( $g ) { $gs ... } ;
      } ) ; } () )
  }

  /**
   * ## Return statement
   *
   * return statement in a routine does nothing. it evaluates the expression
   * and nothing more, continue in any case.
   * TODO: make this statement raise an error.
   */
  rule {
    ( $g ) { return $e:expr ; }
  } => {
    gojs ( $g ) $e
  }
  /**
   * ## Raise statement
   *
   * As in javascript throw throws an exception.
   * It can be handled using the classical `try { } catch (e) { } ` statement.
   */
  rule {
    ( $g ) { throw $e:expr }
  } => {
    gofail ( $g ) $e
  }

  rule {
    ( $g ) { throw $e:expr ; }
  } => {
    gofail ( $g ) $e
  }

  rule {
    ( $g ) { throw $e:expr ; $gs ...}
  } => {
    ( gofail ( $g ) $e ) . bind ( function () { return goexpr ( $g ) { $gs ... } ; } )
  }

  /**
   * ## If statement
   *
   * As expected evaluates the test argument, if it is true, goes on the left,
   * right otherwise.
   */
  rule {
    ( $g ) { if ( $t:expr ) { $l ... } else { $r ... } $gs ... }
  } => {
    goexpr ( $g ) { $t } . bind ( function ( k ) { return k ? goexpr ( $g ) { $l ... } : goexpr ( $g ) { $r ... } ;  } )
  }

  rule {
    ( $g ) { if ( $t:expr ) { $e ... } $gs ... }
  } => {
    goexpr ( $g ) { if ( $t ) { $e ... } else { undefined } $gs ... }
  }

  rule {
    ( $g ) { if ( $t:expr ) $e ; $gs ... }
  } => {
    goexpr ( $g ) { if ( $t ) { $e ; } else { undefined } $gs ... }
  }

  rule {
    ( $g ) { if ( $t:expr ) $e ... else $f:expr $gs ... }
  } => {
    goexpr ( $g ) { if ( $t ) $e ... else { $f } $gs ... }
  }

  /**
   * ## Try/Catch statement
   *
   * This is the try catch statement ;)
   *
   * The nice thing about this is that when a routine is suspended because of
   * a channel op, when resumed, and the continuation raises an excpetion,
   * this is raised to the external point.
   */
  rule {
    ( $g ) { try { $e ... } catch ( $ex:ident ) { $f ... } $gs ... }
  } => {
    // ( gotry goexpr { $e ... } catch ( $ex ) goeexpr { $f ... } ) goseq ( goexpr { $gs ... } )
    ( gotry goexpr ( $g ) { $e ... } catch ( $ex ) goexpr ( $g ) { $f ... } ) . bind ( function () { return goexpr ( $g ) { $gs ... } ; } )
  }
  /**
   * ## Var's
   *
   * This part is dirty, TODO: check if rewriting using gobind is not only clearer but
   * even fast enough
   */
  rule {
    ( $g ) { var $( $a:ident = $e:expr ) (,) ...  ; $gs ... }
  } => {
    (function ($a (,) ...) {
      return  gojs ( $g ) { $($a = $e) (;) ... ; } goseq goexpr ( $g ) { $gs ... }
    } () )
  }

  rule {
    ( $g ) { $v:ident = $e:expr ; $gs ... }
  } => {
    gojs ( $g ) { $v = $e; } goseq goexpr ( $g ) { $gs ... }
  }

  /**
   * ## General javascript expressions
   *
   * General javascript exceptions are evaluated as is.
   */
  rule {
    ( $g ) { $e:expr }
  } => {
    goexpr ( $g ) { $e ; }
  }

  rule {
    ( $g ) { $e:expr ; }
  } => {
    gojs ( $g ) { $e }
  }

  /**
   * # Composition rule
   *
   * Main Composition rule.
   */
  rule {
    ( $g ) { $g0:expr ; $gs ... }
  } => {
    goexpr ( $g ) { $g0 } goseq goexpr ( $g ) { $gs ... }
  }

  rule {
    ( $g ) {}
  } => {
    $g . ret ( function () { return undefined ; } )
  }
}

/**
 * Go macro
 *
 * This is the main way of building a goroutine, as told for goexpr,
 * the main scope of `go` is to wrap `goexpr` that actually build a
 * routine, and starting it.
 *
 *      go { $e ... } => ( goexpr { $e ... } ) . run()
 *
 * It provides some shortcuts for single statement expressions in
 * which the expression could be not wrapped in curly braces
 * i.e.
 *
 *      go while (test) { body } => go { while (test) { body } }
 *
 * ### value
 *
 * A go statement evaluates to `"send"` or `"recv"` if it is suspended
 * on one of these operations, or the last expression of the goroutine.
 * this is not useful for the final user but only for debugging.
 */
macro go {
  rule {
    { $e ... }
  } => {
    (function (core) {
      return  ( goexpr ( core ) { $e ... } ) . run ();
    }( core ) );
  }
  rule {
    while ( $t:expr ) { $b ... }
  } => {
    go { while ( $t ) { $b ... } }
  }

  rule {
    while ( $t:expr ) $b:expr;
  } => {
    go while ( $t ) { $b }
  }

  rule {
    do { $b ... } while ( $t:expr ) ;
  } => {
    go { do { $b ... } while ( $t ) ; }
  }

  rule {
    try { $b ... } catch ( $ex:ident) { $f ... }
  } => {
    go { try { $b ... } catch ( $ex ) { $f ... } }
  }

  rule {
    send $m:expr -> $ch:expr
  } => {
    go { send $m -> $ch; }
  }
  rule {
    for ( $h ... ) { $b ... }
  } => {
    go { for ( $h ... ) { $b ... } }
  }
  /** IF **/
  rule {
    if ( $t:expr ) { $l ... } else { $r ... }
  } => {
    go { if ( $t ) { $l ... } else { $r ... } }
  }
  rule {
    if ( $t:expr ) { $e ... }
  } => {
    go { if ( $t ) { $e ... } }
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

/**
 * # Export
 *
 * Exported macros are `go` and `goexpr`
 * the former the default case, the latter can be useful in case
 * the routine should be deferred, or used as a value.
 */
export go;
export goexpr;
