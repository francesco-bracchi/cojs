var Promise = function (run) {
    this.run = run;
}

Promise.prototype.force = function () {
    if (! this.value) {
	this.value = this.run();
    }
    return this.value;
}

macro delay {
    rule {
	$e:expr
    } => {
	new Promise (function () { return $e; });
    }
}

macro fun {
    rule {
	$fs $b
    } => {
	function $fs $b
    }
}

var x = fun (a) {
    return do_something_with_fn (fun (b) {
	delay (10);
    });
};
