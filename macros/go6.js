macro fun {
    rule {
	( $f:ident (,) ...) $e:expr
    } => {
	function ( $f (,) ... ) { return ( $e ) }
    }
}

macro promise { 
    rule {
	$e:expr
    } => {
	( new go.Promise (fun () ( $e ) ) )
    }
}

macro with_cont {
    rule { 
	( $cont:ident ) $b:expr
    } => {
	( $b ) ( $cont );
    }
}

macro reflect {
    rule {
	( $v:ident , $b:expr , $cont )
    } => {
	( fun ( $v ) $b ) ( $cont )
    }
}

macro reify {
    rule {
	$v:ident = $e:expr { $x:expr } ( $cont )
    } => {
	(function () {
	    macro $v { rule { } => { $e } }
            return with_cont ( $cont ) ( $x );
	}())
    }
}

macro gofun {
    rule {
	( $f:ident (,) ... ) $e:expr
    } => {
	fun ( $f (,) ... ) fun (cont) with_cont (cont) $e 
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

// gomacro ret {
//     rule {
// 	$v
//     } =>  {
// 	with_cont (cont) promise ($v)
//     }
// }

macro ret {
    rule {
	$v ($c)
    } =>  {
	with_cont ( $c ) promise ($v)
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
export reify;
export reflect;
export with_cont;
export gofun;
export gomacro;
export ret;
