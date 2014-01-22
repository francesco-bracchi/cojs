var Cont = function (fun, args, context) {
    this.fun = fun;
    this.context = context || null;
    this.args = args || [];
};

Cont.prototype.call = function () {
    return this.fun.apply(this.context, this.args);
};

Cont.prototype.call = function () {
    return this.fun.apply(this.context, this.args);
};

var tr = function (fun) {
    return function () {
	return new Cont(fun, arguments , this);
    }
};

var runTR = function (f) {
    while (f instanceof Cont) f = f.call();
    return f;
};

var recfun = tr(function (x) {
  return x === 0 ? 0 : recfun(x - 1);
});

// console.log(runTR(recfun(100000000)));
