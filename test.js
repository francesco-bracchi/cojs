var mvar = require('./src/mvar');

var c = mvar();

fork {
  while (true) {
    m <- c;
    console.log ('took: ' + m);
  }
}

fork {
  10 -> c;
  20 -> c;
  30 -> c;
  40 -> c;
}
