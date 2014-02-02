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
    c2 = async.chan(),
    c3 = async.chan();

setTimeout (function () {
  console.log ('pre c0');
  go send "1000" -> c0;
  console.log ('post c0');
},1000);

setTimeout (function () {
  console.log ('pre c1');
  go send "2000" -> c1;
  console.log ('post c1');
},2000);

setTimeout (function () {
  console.log ('pre c2');
  go send "300"  -> c2;
  console.log ('post c2');
},300);

setTimeout (function () {
  console.log ('pre c3');
  go send "3000" -> c3;
  console.log ('post c3');
},3000);

go {
  recv n <- c0 or c1 or c2 or c3; // c0.alt(c1).alt(c2).alt(c3);
  console.log ('n: ' + n);
}

go { 
  recv m <- c3; // c0.alt(c1).alt(c2).alt(c3);
  console.log ('m: ' + n);
}
