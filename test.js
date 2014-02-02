var async = require ('./src/index.js');

var m = 80, n = 0, ch = async.chan(100);

go try { 
  while (true) {
    recv v <- ch;
    console.log ('received 1: ' + v);
  }
} catch (ex) {
  console.log (ex);
};

go try { 
  while (true) {
    recv v <- ch;
    console.log ('received 2: ' + v);
  }
} catch (ex) {
  console.log (ex);
};

go {
  while (n < m) {
    send n -> ch;
    console.log ('sent: ' + n);
    n++;
  }
  ch.close();
};
  
