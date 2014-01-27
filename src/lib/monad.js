var jump = require ('./jump');

var Monad = function (action) {
    this.action = action;
};

var monad = function (fn) {
    return new Monad (fn);
};

var identity = function (x) {
    return jump (function () {
	return x;
    });
};

var throw_ex = function (e) { throw e; };

Monad.prototype.run = function (cont, fail) {
    return this.action (cont || identity, fail || throw_ex).trampoline();
};

var ret = function (v) {
    return monad (function (cont, fail) {
	return jump (function () {
	    return cont (v);
	});
    });
};

var fail = function (e) {
    return monad (function (cont, fail) {
	return jump (function () {
	    return fail (e);
	});
    });
};

var bind = function (m, next) {
    return monad (function (cont, fail) {
	return jump(function () {
	    return m.action (function (v) {
		return jump (function () {
		    return next(v).action (cont, fail);
		});
	    }, fail);
	});
    });
};

var alt = function (m, n) {
    return monad (function (cont, fail) {
	return jump (function () {
	    return m.action (cont, function (ex) {
		return jump (function () {
		    return n.action (cont, fail);
		});
	    });
	});
    });
};

Monad.prototype.bind = function (fun) {
    return bind (this, fun);
};


Monad.prototype.alt = function (n) {
    return alt (this, n);
};

monad.ret = ret;

monad.fail = fail;

module.exports = monad;
