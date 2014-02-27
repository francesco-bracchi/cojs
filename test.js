
var mvar = require('./src/mvar'),
    core = require('./src/core');

var box = mvar(),
    other = mvar();

fork {
  while (true) {
    val v =? box;
    other ! v+1;
    if (v >= 0) {
      u = 10;
    } else { 
      x = 11;
    }
  }
}
fork {
  val v = ?other;
  console.log ('other: ' + v);
}

fork { box ! 20; }
