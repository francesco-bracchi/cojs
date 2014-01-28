var async = require ('./src/index.js');

var m = 100, n = 0, ch = async.chan();

go while (n < m) {
  send n -> ch;
  n++;
};

go while (true) {
  recv v <- ch;
  console.log ('new number: ' + v);
};


var x;

go {
  try {
    x = 10;
    throw 77;
  } catch (e) {
    x = 12;
  }
  x = 233;
}


console.log (x);
