var async = require ('./src/index.js');

var m = 10000, n = 0, ch = async.chan();

go while (true) {
  recv v <- ch;
  console.log ('new number: ' + v);
}

go for (var j = 0; j < m; j++) {
  send  j -> ch;
};
