macro foo {
    rule {
	$n = $e
    } => {
	var $n = $e
    }
}

export foo;
