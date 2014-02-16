// see [monad on wikipedia](https://en.wikipedia.org/wiki/Monad_%28functional_programming%29)
// 
// A monad is an object (composable) that represent a piece of computation.
// the main way of composing it is the `bind` operator, that binds the 
// result of a piece of computation to a value, and calculate a new monad,
// i.e. 
// 
//      m.bind (function (x) { var n = new Monad (...); return n; }
//  
// this expression evaluates to a new monad, that is the application of `m`,
// and then `n`. `n` could be parameterized on x, that is the value yielded by
// `m`.
//
// ***Monad internals***
// 
// Our monad concrete type is a function that takes 3 arguments, a continuation
// to be called in case of sucess, a failure thunk in case of exception, and 
// a queue of the active coroutines, the result is a `Jump` object.
// the continuation take as arguments the value, the fail thunk and the queue of 
// acive coroutines, while the fail function takes the excpetion object, the 
// success thunk and again the queue of active coroutines.

'use strict';

var Jump = require ('./jump'),
    Queue = require ('./data_structures/linkedListQueue');

var Monad = function (action) {
  this.action = action;
};

var initial_continuation = function (v, fail, scheduler) {
  if (scheduler.empty()) {
    return v;
  }
  var next = scheduler.deq();
  return next(scheduler);
};

var initial_fail = function (e, cont, scheduler) {
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
Monad.prototype.run = function () {
  var v = this.action (initial_continuation, initial_fail, new Queue());
  while (v instanceof Jump) {
    v = v.bounce();
  }
  return v;
};

// ### Bind
// composes 2 monads
var bind = function (m, next) {
  return new Monad (function (cont, fail, scheduler) {
    return m.action (function (v, fail1, scheduler1) {
      return new Jump(function () { 
        return next(v).action(cont, fail1, scheduler1); 
      });
    }, fail, scheduler);
  });
};

// ### Alt
// composes 2 monads alternativately, while bind imposes a sequential order, 
// the alt operator composes 2 monads in parallel, if the first fails, the 
// second is executed (used to implement the `try{...} catch (e) {...}` block.
var alt = function (m, handler) {
  return new Monad (function (cont, fail, scheduler) {
    return m.action(cont, function (err, cont1, scheduler1) {
      return new Jump(function () {
        return handler(err).action (cont1, fail, scheduler1);
      });
    }, scheduler);
  });
};

Monad.prototype.bind = function (fun) {
  return bind (this, fun);
};

Monad.prototype.alt = function (fun) {
  return alt (this, fun);
};

module.exports = Monad;
