var async = require ('./src/index.js');

var m = 100, n = 0, ch = async.chan();

go while (n < m) {
  console.log ('pre');
  send n -> ch;
  console.log ('post');
  n++;
};

go do {
    console.log ('pre number');
    recv v <- ch;
    console.log ('new number: ' + v);
} while (true);


