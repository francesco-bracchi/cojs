var monad = require ('go/lib/monad.js'),
    chan = require ('../src/lib/channel.js');

macro goexpr {
    rule {
				{
						recv $v:ident <- $ch:expr;
						$gs ...
				}
    } => {
				$ch . recv () . bind (function ( $v) { return goexpr { $gs ... } } )
				// bind ( recv ( $ch ) , function ( $v ) { return goexpr { $gs ... } } )
    }

    rule {
				{
						send $m:expr -> $ch:expr;
				}
    } => {
				// send ( $m , $ch )
				( $ch ) . send ( $m )
    }
    rule {
				{
						send $m:expr -> $ch:expr;
						$gs ...
				}
    } => {
				( $ch ) . send ( $m ) . bind (function ( ) { return goexpr { $gs ... } } );
    }

    rule {
				{
						while ( $t:expr ) { $b ... }
						$gs ...
				}
    } => {
				(function () {
						var loop = function (_) {
								var b = goexpr { $b ... };
								if ( $t ) {
										return b.bind(loop);
								}
								return goexpr { $gs ... };
						};
						return loop();
				}())
    }

    rule {
				{
						while ( $t:expr ) $e:expr ;
						$gs ...
				}
    } => {
				goexpr { while ( $t ) { $e } $gs ... }
    }

    rule {
				{ throw $e:expr; }
    } => {
				// monad (cont, fail) { return promise (fail ($e)) }
				monad . fail ( $e )
    }

    rule {
				{ if ( $t ) { $l .. } else { $r ... } $gs ... }
    } => {
				(function () {
						var rest = function () { return goexpr { $gs ... } };
						return ( $t ) 
								? ( goexpr { $l ... } ) . bind ( $rest ) 
						: ( goexpr { $r ... } ) . bind ( $rest );
				}())
    }

    rule {
				try { $e ... } catch ($e:ident) { $f ... } finally { $f ... }
				$gs ...
    } => {
				goexpr { $e ... }
    }

    rule {
    		{ $g:expr ; }
    } => {
				monad.ret ($g);
    }

    rule {
				{ $g:expr ; $gs ... }
    } => {
				monad.ret ( $g ) .bind ( function () { return goexpr { $gs ... } } )
    }

    rule {
				{var $as ... ; $gs ... }
    } => {
				(function () {
						var $as ... ;
						return goexpr { $gs ... };
				}());
    }

    rule {
				{$v:ident = $e:expr ; $gs ... }
    } => {
				(function () {
						$v = $e;
						return goexpr { $gs ... };
				}());
    }

    rule {
				{}
    } => {
				monad.ret(undefined);
    }
}

macro go {
    rule {
				{ $e ... }
    } => {
				( goexpr { $e ... } ).run();
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
				send $m:expr -> $ch:expr ;
    } => {
				go { send $m -> $ch; }
    }
}

export go;
export goexpr;
