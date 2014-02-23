// see [monad on wikipedia](https://en.wikipedia.org/wiki/Action_%28functional_programming%29)
// 
// A monad is an object (composable) that represent a piece of computation.
// the main way of composing it is the `bind` operator, that binds the 
// result of a piece of computation to a value, and calculate a new monad,
// i.e. 
// 
//      m.bind (function (x) { var n = new Action (...); return n; }
//  
// this expression evaluates to a new monad, that is the application of `m`,
// and then `n`. `n` could be parameterized on x, that is the value yielded by
// `m`.
//
// ***Action internals***
// 
// Our monad concrete type is a function that takes 3 arguments, a continuation
// to be called in case of sucess, a failure thunk in case of exception, and 
// a queue of the active coroutines, the result is a `Trampoline` object.
// the continuation take as arguments the value, the fail thunk and the queue of 
// acive coroutines, while the fail function takes the excpetion object, the 
// success thunk and again the queue of active coroutines.

'use strict';

var Trampoline = require ('./trampoline'),
    Queue = require ('./data_structures/linkedListQueue');

var Action = function (take) {
  this.take = take;
};

var initial_continuation = function (v, fail, active) {
  if (active.empty()) {
    return new Trampoline(function () { return v; });
  }
  var next = active.deq();
  return next(active);
};

var initial_fail = function (e, cont, active) {
  throw e;
};

// ### run
// Actually run the monad. passing as initial continuation, a thunk that returns
// the actual value.
// the fail raises an exception back to the javascript world,
// and the third parameter is an empty queue.
// Actually this queue should be a functional object, but since the execution
// model makes this unique in any case, is not a problem using an ephemeral queue
// implementation, like the classical `LinkedListQueue`.
Action.prototype.run = function () {
  return this.take(initial_continuation, initial_fail, new Queue()).jump();
};

// ### Bind
// composes 2 monads
var bind = function (m, next) {
  return new Action (function (cont, fail, active) {
    var _cont = function (v, _fail, _active) {
      return new Trampoline(function () { 
        return next(v).take(cont, _fail, _active); 
      });
    };
    return m.take (_cont, fail, active);
  });
};


// ### Then
// composes 2 monads, ignoring parameter
//
//     a.then(b)
//
// is the same of 
// 
//     a.bind(function() { return b; })
// 
var then = function (m, n) {
  return new Action (function (cont, fail, active) {
    var _cont = function (v, _fail, _active) {
      return new Trampoline(function () { 
        return n.take(cont, _fail, _active); 
      });
    };
    return m.take (_cont, fail, active);
  });
};

// ### Error
// composes 2 monads alternativately, while bind imposes a sequential order, 
// the error operator composes 2 monads in parallel, if the first fails, the 
// second is executed (used to implement the `try{...} catch (e) {...}` block.
var error = function (m, handler) {
  return new Action (function (cont, fail, active) {
    var _fail = function (err, _cont, _active) {
      return new Trampoline(function () {
        return handler(err).take (_cont, fail, _active);
      });
    };
    return m.take(cont, _fail, active);
  });
};

Action.prototype.bind = function (fun) {
  return bind (this, fun);
};

Action.prototype.then = function (action) {
  return then (this, action);
};

Action.prototype.error = function (fun) {
  return error (this, fun);
};

module.exports = Action;
