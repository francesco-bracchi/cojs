var async = require ('./src/index.js');

var m = 13000, n = 0, ch = async.chan();

go {
  while (n < m) {
    send n -> ch;
    n++;
  }
  ch.close();
};

go try { 
  while (true) {
    recv v <- ch;
    console.log ('received: ' + v);
  }
} catch (ex) {
  console.log (ex);
};

