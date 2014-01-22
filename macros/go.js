macro go {

    rule {
	{ $e ... }
    } => {
	go_walk { $e ... }
    } 

    rule {
	while ( $t ) $b:expr
    } => {
	go { while ( $t ) $b }
    } 

    rule {
	do $b:expr while ( $t )
    } => {
	go { do $b while ( $t ) }
    }

    rule {
	if ( $t ) $l:expr else $r:expr
    } => {
	go { if ( $t ) $l else $r; }
    }

    rule {
	send $v:expr -> $ch:expr;
    } => { 
	go { send $v -> ch; }
    }

    rule {
	$e
    } => {
	go { $e }
    }
}

macro go_walk {

    // receive message from channel(s) 
    rule {
	{ recv $v:ident <- $c0:expr or $c1:expr or $cs ... ; $e ... } 
    } => {
	go_walk { recv $v <- ( $c0 ).orelse ( $c1 ) or $cs ... ; $e ... }
    }

    rule {
	{ recv $v:ident <- $c0:expr or $c1:expr ; $e ... } 
    } => {
	go_walk { recv $v <- ( $c0 ).orelse ( $c1 ); $e ... }
    }

    rule {
	{ recv $v:ident <- $ch:expr ; $e ... }
    } => {
	( $ch ).recv ( function ( $v ) { go_walk { $e ... } })
    }

    // send message to a channel
    rule {
	{ send $v:expr -> $ch:expr ; $e ... }
    } => {
	( $ch ).send ( $v, function () { go_walk { $e ... } })
    }
    
    // while loop 
    rule {
    	{ while ( $t ) { $b ... } $e ...}
    } => {
	// todo: make tail recursive
	var loop = function () {
	    if ( $t ) {
		go_walk { $b ... loop(); }
	    }
	    else {
		go_walk { $e ... }
	    }
	};
	loop();
    }

    rule {
    	{ while ( $t ) $b:expr $e ...}
    } => {
	go_walk { while ( $t ) { $b } $e ... }
    }

    // do .. while loop 
    rule {
	{ do { $b ... } while ( $t ) $e ... }
    } => {
	var loop = function () {
	    go_walk { $b ... 
		      if ( $t ) {
			  loop ();
		      } else {
			  $e ... 
		      }
		    }
	}
	loop ();
    }
    
    rule {
    	{ do $b:expr while ( $t ) $e ...}
    } => {
	go_walk { do { $b } while ( $t ) $e ... }
    }
    
    // if expression
    rule {
	{ if ( $t ) { $l ... } }
    } => {
	if ( $t ) {
	    go_walk { $l ... } 
	}
    }
    
    rule {
	{ if ( $t ) $l:expr }
    } => {
	if ( $t ) {
	    go_walk { $l } 
	}
    }
    
    rule {
	{ if ( $t ) { $l ... } else { $r ... } }
    } => {
	if ( $t ) {
	    go_walk { $l ... } 
	} else {
	    go_walk { $r ... }
	}
    }

    rule {
	{ if ( $t ) $l:expr else { $r ... } }
    } => {
	if ( $t ) {
	    go_walk { $l } 
	} else {
	    go_walk { $r ... }
	}
    }

    rule {
	{ if ( $t ) { $l ... } else $r:expr }
    } => {
	if ( $t ) {
	    go_walk { $l ... } 
	} else {
	    go_walk { $r }
	}
    }

    rule {
	{ if ( $t ) $l:expr else $r:expr }
    } => {
	if ( $t ) {
	    go_walk { $l } 
	} else {
	    go_walk { $r }
	}
    }

    // generic sequence combination
    rule {
	{ $e $es ... }
    } => {
	$e go_walk { $es ... }
    }
    
    rule {
	{ $e }
    } => {
	$e
    }

    rule {
	{}
    } => {
    }
}


export go;
export go_walk;


