// shorthand for function (...) { return bar; }
macro fun {
    rule {
	$f { $b }
    } => {
	function $fs { return $b; };
    }
}

// creates a delayed execution, it's used by
// trampoline to run step by step without 
// incurring in stack overflows
macro go_jump {
    rule {
	$e
    } => {
	( new go.Jump (fun () { $e } ) )
    }
}

// simply put the continuation as an extra
// element in the sequence (surrounded by 
// round brackets 
macro with_args {
    rule {
	($cont) { $e }
    } => {
	$e ( $cont )
    }
}

// reflect is used to access explicitely to the
// continuation
macro go_reflect {
    rule {
	( $v:lit ) { $b } ( $cont )
    } => {
	( fun ( $v ) { $b } ( $cont ) );
    }
}

// reify assigns to a variable a monad, and 
// uses it in the context
macro go_reify {
    rule {
	$v:lit = $e { $x } ( $cont )
    } => {
	macro $v { rule { } => { $e } }
	with_args ( $cont ) { $x };
    }
}

// this macro is used to create monad primitives
// that are actually functions
macro go_fun {
    rule {
	$fp { $b }
    } => {
	fun $fp {
	    fun (cont) {
		with_args (cont) { $b }
	    }
	}
    }
}

// macro generating macros!
// for generating macros that behave like monads
macro go_macro  {
    rule {
	$name { rule { $patt ... } => { $result ... } }
    } => {
	macro $name { 
	    rule {
		$patt ... (cont) 
	    } => {
		with_args (cont) { $result ... }
	    }
	}
    }
}

go_macro go_run {
    rule {
	($m)
    } => {
	go_run ($m, fun (x) { x })
    }
    rule {
	($m, $cont) 
    } => {
	go.trampoline (with_args ($cont) { $m })
    }
}

// monad return operator
go_macro go_return {
    rule {
	( $v )
    } => {
	go_reflect (cont) {
	    go_jump ( cont ( $v ) )
	}
    }
}

// monad bind operator
go_macro go_bind {
    rule {
	 $v:lit = $m { $n }
    } => {
	go_reify m = $m {
	    go_reify n = $n {
		go_reflect (cont) {
		    go_jump ( m ( fun (v) { 
			go_jump ( n (cont) )
		    }))
		}
	    }
	}
    }
}

// monad sequence operator
go_macro go_seq {
    rule {
	{ $a ; $b }
    } => {
	go_bind ignore = $a { $b }
    }
}

go_macro go_recv {
    rule {
	($ch)
    } => {
	go_reflect (cont) { 
	    ($ch).recv (fun (v) {
		go_run (cont(v)); 
	    });
	}
    }
}

go_macro go_send {
    rule {
	($ch, $v) 
    } => {
	go_reflect (cont) {
	    ($ch).send (fun (v) {
		go_run (cont (v));
	    });
	}
    }
}

go_macro go_if {
    rule {
	( $t ) $l else $r
    } => {
	go_reify l = $l {
	    go_reify r = $r {
		go_reflect (cont) {
		    ( $t ) ? l (cont) : r (cont)
		}
	    }
	}
    }
}


go_macro go_eval {
    rule {
	block { recv $v:lit <- $ch; $es ... }
    } => {
	go_bind $b = go_recv ($ch) { 
	    go_eval { $es ... } 
	}
    }

    rule {
	block { send $m -> $ch; $es ... }
    } => {
	go_bind ign = go_send ($v, $ch) {
	    go_eval { $es ... } 
	}
    }

    rule {
	block {}
    } => {
	go_return (undefined)
    }
    rule {
	block { $e }
    } => {
	go_eval $e;
    }

    rule {
	block { $e $es ... }
    } => {
	go_seq ( go_eval $e, go_eval block { $es ... } )
    }

    rule {
	if ( $t ) { $l ... }
    } => {
	go if ( $t ) block { $l ... }
    }
    
    rule {
	if ( $t ) $l 
    } => {
	go if ( $t ) $l else {}
    }

    rule {
	if ( $t ) $l else { $r ... }
    } => {
	if ( $t ) $l else block { $r ... }
    }
    
    rule {
	if ( $t ) $l else $r
    } => {
	go_if ( $t ) (go $l) else (go $r)
    }



    // TODO HERE WHILE?
    rule {
	{ while ( $t ) { $b ... } $e ... }
    } => {
	go_while 
    }
}
