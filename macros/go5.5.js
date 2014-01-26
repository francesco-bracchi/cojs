macro fun {
    rule {
	( $f (,) ...) $e
    } => {
	function ( $f (,) ... ) { return ( $e ) }
    }
}

macro promise { 
    rule {
	$e
    } => {
	( new go.Promise (fun () ( $e ) ) )
    }
}

macro with_cont {
    rule { 
	( $cont ) $n ($x (,) ...)
    } => {
	$n ($x (,) ... , $cont)
    }
}

macro reflect {
    rule {
	( $v:ident , $b:expr , $cont )
    } => {
	( function ($v) { return $b; } ($cont) )
    }
}

macro reify {
    rule {
	$v:ident = $e { $x } ( $cont )
    } => {
	macro $v { rule { } => { $e } }
	with_cont ( $cont ) ( $x )
    }
}

macro gofun {
    rule {
	( $f (,) ... ) ( $e ... )
    } => {
	fun ( $f (,) ... ) ( fun (cont) ( with_cont (cont) ( $e ... ) ) )
    }
}

macro gomacro {
    rule {
	$name {
	    rule { $p ... } => { $r ... }  ...
	}
    } => {
	macro $name {
	    rule {
		$p ... ($cont)
	    } => {
		with_cont ( $cont ) ( $r ... )
	    } ...
	}
    }
}

macro ret {
    rule {
	$e ( $cont )
    } => {
	promise ( $cont ( $e ) )
    }
}

macro run {
    rule {
	( $m )
    } => {
	run ( $m , fun (x) (x) )
    }
    rule {
	( $m , $cont )
    } => {
	with_cont ( $cont ) $m
    }
}

export fun;
export promise;
export reflect;
export with_cont;
export gofun;
export go_macro;
