var async = require ('./src/index.js');

var n = 0,
    ch = async.chan();

go while (true) {
  send n -> ch;
  n++;
};


go while (true) {
  recv v <- ch;
  console.log ('new number: ' + v);
};
