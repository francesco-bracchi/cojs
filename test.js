
var mvar = require('./src/mvar'),
    core = require('./src/core');

var box = mvar(),
    other = mvar();

fork {
  while (true) {
    val v =? box;
    other ! v+1;
  }
}
fork {
  val v = ?other;
  console.log ('other: ' + v);
}

fork { box ! 20; }
