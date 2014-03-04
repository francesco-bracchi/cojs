
'use strict';

var proxy = function (m, o) {
  fork {
    val x = ?m;
    o! x;
  }
};

// alt operator between two mvars/channels.
// it 
//
// 1. creates a new (*empty*) mvar,
// 1. fork the `proxy` function on the 2 arguments, i.e. `take` from the argument channel and 
//    writes to the newly created mvar.
// 1. returns the newly created mvar.
//
// the scope of this is to have an mvar that is `take` ready when one of the 2 arguments is `take` ready.
// the use case is setting a timeout
// 
//     ch.alt(timeout(1000))
//
// the `take` event on the second firing channel/mvar is generally ignored
var alt = function (m, n) {
  var o = mvar();
  proxy (m, o);
  proxy (n, o);
  return o;
};

module.exports = alt;
