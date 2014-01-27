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
	    while ( $t:expr ) { $b ... }
	    $gs ...
	}
    } => {
	(function () {
          var loop = function (_) {
            var b = goroutine { $b ... };
            if ( $t ) {
              return b.bind(loop);
            }
	    return goroutine { $gs ... };
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
	goroutine { while ( $t ) { $e } $gs ... }
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
// while is not implemented correctly (do not executes the first while instruction
// when restarts the loop

go {
  console.log ('pre producer');
  while (n < 10000) {
    console.log ('producer');
    send n -> nums;
    // recv _ <- timeout (1000);
    n++;
  }
  console.log ('post producer');
};

go {
  console.log ('pre consumer');
  while (true) {
    console.log ('consumer');
    recv n <- nums;
    console.log ('n: ' + n);
    // recv _ <- timeout (0);
  }
  console.log ('post consumer');
}
