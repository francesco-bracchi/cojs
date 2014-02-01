var async = require ('./src/index.js');

var m = 5000, n = 0, ch = async.chan(10);

go while (true) {
  recv v <- ch;
//  console.log ('new number: ' + v);
};

go {
  while (n < m) {
    send  n -> ch;
    // console.log ('sent: ' + n);
    n++;
  }
  ch.close();
};

