// does ping/pong between 2 processes 100 times

var mvar = require ('./src/mvar');

var max = 100000,
    m0 = mvar(),
    m1 = mvar();

go {
  var x = 0;
  while (x < max) {
    take m <- m0;
    console.log ('ping ' + m);
    put m + 1 -> m1;
    x = x + 1;
  }
}

go {
  while (true) {
    take m <- m1;
    console.log ('pong ' + m);
    put m + 1 -> m0;
  }
}

console.log ('start');
go put 0 -> m0;
console.log ('end');
