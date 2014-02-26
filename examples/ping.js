// does ping/pong between 2 processes 100 times

var mvar = require ('../src/mvar'),
    core = require ('../src');

var max = 100000,
    m0 = mvar(),
    m1 = mvar();

var x = 0;
fork {
  while (x < max) {
    val m = ?m0;
    console.log ('ping ' + m);
    m1 ! m + 1;
    x++;
  }
}

fork {
  while (true) {
    val m = ?m1;
    console.log ('pong ' + m);
    m0 ! m+1;
  }
}

console.log ('start');
fork { m0! 0 }
console.log ('end');
