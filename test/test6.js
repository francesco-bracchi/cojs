var Promise = function (fun) {
    this.fun;
};

var go = {
    Promise: Promise
};

// var a = fun (x) (x + 10);

// var b = promise (a(10));

// var c = with_cont (cont) f(x,y,z);

// var d = reflect (cont, cont (10), k);

// var e = reify a = _ret (10) {
//     reify b = _ret (29) {
// 	bind (a, b) 
//     } (cont)
// } (cont);

var id = fun(x) x;

var ret = gofun (x) reflect (k) k(x);

var f = with_cont (id) ret (id);

// var v = 
// reify a = _ret (10) {
//     reify b = _ret (20) { 
// 	bind (a, b) 
//     } (cont)
// } (cont)


