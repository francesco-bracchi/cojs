macro goeval {
    rule {
	recv $v:ident <- $ch:expr
    } => {
	function (cont) {
	    ( $ch ).recv (function ($v) { 
		go.trampoline(cont (v)
	    });
	}
	}
    }
    rule {
	send $m -> $ch:expr;
	$e ...
    } => {
	function (cont) {
	    ( $ch ).recv (function (v) {
		go.trampoline (goeval { $e ... } (cont));
	    });
	}
    }
    
    rule {
	$e; $es ...
    } => {
	function (cont) {
	    $e;
	    return new Promise (function () {
		goeval { $es ... } (cont);
	    });
	}
    }

    rule {
	while ( $t ) { $b ... } 
	$e ...
    } => {
	var body = goeval { $b ... };
	var rest = goeval { $e ... };
	var loop = new Promise(function () {
	    if ( $t ) body (true);
	});
    }
}
