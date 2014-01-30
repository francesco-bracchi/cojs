var async = require ('./src/index.js');

var m = 10000, n = 0, ch = async.chan();

go {
    while (n < m) {
      send n -> ch;
      n++;
    }
  ch.close();
};

go try{
  while (true) {
    recv v <- ch;
    console.log ('new number: ' + v);
  }
} catch (e) {
  console.log ('exception');
  throw new Error ('mo ci cambio nome');
}
