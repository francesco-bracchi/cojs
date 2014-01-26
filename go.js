var future = require ('./src/future.js'),
    monad = require ('./src/monad.js'),
    chan = require ('./src/channel.js');

macro goroutine {
    rule {
	{
	    recv $v:ident <- $ch:expr; 
	    $gs ...
	}
    } => {
	$ch . recv () . bind (function ( $v) { return goroutine { $gs ... } } )
	// bind ( recv ( $ch ) , function ( $v ) { return goroutine { $gs ... } } )
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
	( $ch ) . send ( $m ) . bind (function ( ) { return goroutine { $gs ... } } );
    }

    rule {
	{ 
	    while ( $t ) { $b ... } 
	    $gs ... 
	}
    } => {
	(function () {
	    var body = goroutine { $b ... };
	    var rest = goroutine { $gs ... };
	    var loop = function (_) {
		// return ( $t ) ? bind (body , loop) : rest;
		return ( $t ) ? body.bind (loop) : rest;
	    };
	    return loop ();
	}())
    }

    rule {
	{ 
	    while ( $t ) $e:expr ; 
	    $gs ... 
	}
    } => {
	goroutine { while ( $t ) { $e:expr } $gs ... }
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
	    var left = goroutine { $l ... };
	    var right = goroutine { $r ... };
	    var rest = function () { return goroutine { $gs ... } };
	    // return ( $t ) ? bind (left, rest) : bind (right, rest);
	    return ( $t ) ? left . bind ( $rest ) : right . bind ( $rest );
	}())
    }
    
    rule {
	try { $e ... } catch ($e:ident) { $f ... } finally { $f ... }
	$gs ...
    } => {
	goroutine { $e ... }
    }
    
    rule {
    	{ $g:expr ; }
    } => {
	monad.ret ($g);
    }

    rule {
	{ $g:expr ; $gs ... }
    } => {
	monad.ret ( $g ) .bind ( function () { return goroutine { $gs ... } } )
    }

    rule {
	{var $as ... ; $gs ... }
    } => {
	(function () {
	    var $as ... ;
	    return goroutine { $gs ... };
	}());
    } 

    rule {
	{$v:ident = $e:expr ; $gs ... }
    } => {
	(function () {
	    $v = $e;
	    return goroutine { $gs ... };
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
	( goroutine { $e ... } ).start();
    }
    
    rule {
	while ( $t ) { $b ... }
    } => {
	go { while ( $t ) { $b ... } }
    }

    rule {
	while ( $t ) $b:expr;
    } => {
	go while ( $t ) { $b }
    }

    rule {
	send $m:expr -> $ch:expr ;
    } => {
	go { send $m -> $ch; }
    }
}

// macro js {
//     rule {
// 	( $e:expr )
//     } => {
// 	ret ($e);
//     }
 
//     rule {
// 	( var $v:ident = $e:expr, $es ... )
//     } => {
// 	bind ( js ( $e ) , function ( $v ) { return js ($es ... ) })
//     }
    
//     rule {
// 	( var $v:ident = $e:expr )
//     } => {
//     }
// }

macro js {
    rule {
	( $e )
    } => {
	(function () {
	    $e
	    return ret (undefined);
	})
    }
}


var timeout = function (ms, val) {
    var ch = chan ();
    setTimeout (function () {
	go send val -> ch;
    }, ms);
    return ch;
};

// go { 
//     console.log ('0');
//     recv v <- timeout (3400, 'haha');
//     console.log ('then: ' + v);
// }


var chan = require ('./src/channel.js');

var nums = chan ();

var n = 0;

// todo:
// this stack overflow seems to be from channels
// fix it.

go while (true) {
    console.log ('producer');
    send n -> nums;
    n++;
}

go while (true) {
    console.log ('consumer');
    recv n <- nums;
    console.log ('n: ' + n);
}