'use strict';

var async = require ('./src/index.js');

// var m = 80000, n = 0, ch = async.chan(10);

// go try {
//   while (true) {
//     recv v <- ch;
//     console.log ('received 1: ' + v);
//   }
// } catch (ex) {
//   console.log (ex);
// }

// go try { 
//   while (true) {
//     recv v <- ch;
//     console.log ('received 2: ' + v);
//   }
// } catch (ex) {
//   console.log (ex);
// }

// go {
//   while (n < m) {
//     send n -> ch;
//     console.log ('sent: ' + n);
//     n++;
//   }
//   ch.close();
// }
  
var c0 = async.chan(),
    c1 = async.chan(),
    c2 = async.chan();

setTimeout (function () {
  go send "t0" -> c0;
},1000);

setTimeout (function () {
  go send "t1" -> c1;
},2000);

setTimeout (function () {
  go send "t2" -> c2;
},300);

go {
  recv n <- c0.alt(c1).alt(c2);
  console.log ('n: ' + n);
}
