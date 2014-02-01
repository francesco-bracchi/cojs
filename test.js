var async = require ('./src/index.js');

var m = 13, n = 0, ch = async.chan(5);

go {
  while (n < m) {
    send n -> ch;
    console.log ('sent: ' + n);
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

