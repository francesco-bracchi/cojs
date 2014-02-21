'use strict';
console.log ('starty');
var //chan = require('./src/chan'),
    mvar = require('./src/mvar');

var c = mvar();

go {
  while (true) {
    take m <- c;
    console.log ('took: ' + m);
  }
}

go {
  put 10 -> c;
  put 20 -> c;
  put 30 -> c;
  put 40 -> c;
  put 50 -> c;
  put 60 -> c;
  put 70 -> c;
  put 80 -> c;
}
