'use strict';
// does ping/pong between 2 processes 100 times

var mvar = require ('../src/mvar'),
    max = 100000,
    m0 = mvar(), 
    m1 = mvar();

fork {
  for (var x = 0; x < max; x++) {
    var m <~m0;
    console.log ('ping ' + m);
    m+1 ~> m1;
  }
}

fork {
  while (true) {
    var m <~ m1;
    console.log ('pong ' + m);
    m+1 ~> m0;
  }
}

console.log ('start');
fork { 0 ~> m0; }
console.log ('end');
