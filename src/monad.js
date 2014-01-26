var future = require ('./future');

var Monad = function (action) {
    this.action = action;
};

var monad = function (fn) {
    return new Monad (fn);
};

var identity = function (x) { 
    return future (function () { 
	return x;
    }); 
};

var throw_ex = function (e) { throw e; };

Monad.prototype.start = function () {
    var cont = arguments[0] || identity;
    var fail = arguments[1] || throw_ex;
    return this.action (cont, fail).resume();
};

var ret = function (v) {
    return monad (function (cont, fail) {
	return future (function () {
	    return cont (v);
	});
    });
};

var fail = function (e) {
    return monad (function (cont, fail) {
	return future (function () {
	    return fail (e);
	});
    });
};

var bind = function (m, next) {
    return monad (function (cont, fail) {
	return future(function () {
	    return m.action (function (v) {
		return future (function () {
		    return next(v).action (cont, fail);
		});
	    }, fail);
	});
    });
};

var alt = function (m, n) {
    return monad (function (cont, fail) {
	return future (function () {
	    return m.action (cont, function (ex) {
		return future (function () {
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
