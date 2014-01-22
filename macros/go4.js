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
macro jump {
    rule {
	$e
    } => {
	( new go.Jump (fun () { $e } ) )
    }
}

// simply put the continuation as an extra
// element in the sequence (surrounded by 
// round brackets 
macro with_cont {
    rule {
	($cont) { $e }
    } => {
	$e ( $cont )
    }
}

// reflect is used to access explicitely to the
// continuation
macro reflect {
    rule {
	( $v:lit ) { $b } ( $cont )
    } => {
	( fun ( $v ) { $b } ( $cont ) );
    }
}

// reify assigns to a variable a monad, and 
// uses it in the context
macro reify {
    rule {
	$v:lit = $e { $x } ( $cont )
    } => {
	macro $v { rule { } => { $e } }
	with_cont ( $cont ) { $x };
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
		with_cont (cont) { $b }
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
		with_cont (cont) { $result ... }
	    }
	}
    }
}

go_macro go_run {
    rule {
	$p
    } => {
	var identity = fun (i) { i };
	go.trampoline (with_cont (identity) { $p });
    }
}

// monad return operator
go_macro ret {
    rule {
	$v
    } => {
	reflect (cont) {
	    jump ( cont ( $v ) )
	}
    }
}

// monad bind operator
go_macro bind {
    rule {
	 $v:lit = $m { $n }
    } => {
	reify m = $m {
	    reify n = $n {
		reflect (cont) {
		    jump ( m ( fun (v) { 
			jump ( n (cont) )
		    }))
		}
	    }
	}
    }
}

// monad sequence operator
go_macro seq {
    rule {
	{ $a ; $b }
    } => {
	bind ignore = $a { $b }
    }
}

go_macro recv {
    rule {
	($ch)
    } => {
	reflect (cont) { 
	    ($ch).recv (jump(cont(true)));
	}
    }
}

go_macro send {
    rule {
	($ch, $v) 
    } => {
	reflect (cont) {
	    ($ch).send (jump (cont (true)));
	}
    }
}

go_macro go_if {
    rule {
	( $t, $l, $r)
    } => {
	reify l = $l {
	    reify r = $r {
		reflect (cont) {
		    ( $t ) ? l (cont) : r (cont)
		}
	    }
	}
    }
}


go_macro go_eval {
    rule {
	{ recv $v:lit <- $ch; $es ... }
    } => {
	bind $b = recv ($ch) { 
	    go_eval { $es ... } 
	}
    }

    rule {
	{ send $m -> $ch; $es ... }
    } => {
	bind ign = send ($v, $ch) {
	    go_eval { $es ... } 
	}
    }
    rule {
	{ if ( $t ) $l else $r }
    } => {
	go_if ($t, go_eval $l, go_eval $r);
    }
    // TODO HERE WHILE?
    rule {
	{ while ( $t ) { $b ... } $e ... }
    } => {
	go_while 
    }

    rule {
	{}
    } => {
	ret(undefined)
    }
    rule {
	{ $e }
    } => {
	ret($e)
    }

    rule {
	{ $e $es ... }
    } => {
	go_seq ( go_eval $e, go_eval $es)
    }
}
