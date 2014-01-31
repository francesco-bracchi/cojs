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


47.46user 0.54system 0:48.85elapsed 98%CPU (0avgtext+0avgdata 53840maxresident)k
0inputs+0outputs (0major+13588minor)pagefaults 0swaps
