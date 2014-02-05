'use strict';

// var m = 80000, n = 0, ch = gozilla.chan(10);

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

// var gozilla = require ('gozilla');

// var c0 = gozilla.chan(),
//     c1 = gozilla.chan(),
//     c2 = gozilla.chan(),
//     c3 = gozilla.chan();

// setTimeout (function () {
//   console.log ('pre c0');
//   go send "1000" -> c0;
//   console.log ('post c0');
// },1000);

// setTimeout (function () {
//   console.log ('pre c1');
//   go send "2000" -> c1;
//   console.log ('post c1');
// },2000);

// setTimeout (function () {
//   console.log ('pre c2');
//   go send "300"  -> c2;
//   console.log ('post c2');
// },300);

// setTimeout (function () {
//   console.log ('pre c3');
//   go send "3000" -> c3;
//   console.log ('post c3');
// },3000);

// go {
//   recv n <- c0 or c1 or c2 or c3; // c0.alt(c1).alt(c2).alt(c3);
//   console.log ('n: ' + n);
// }

// go {
//   recv m <- c3; // c0.alt(c1).alt(c2).alt(c3);
//   console.log ('m: ' + m);
// }

var timeout = require ('gozilla/channels/timeout.js');

console.log ('start');

var c0 = timeout(1000, "c0"),
    c1 = timeout(2000, "c1"),
    c2 = timeout(300,  "c2"),
    c3 = timeout(3000, "c3");
go {
  recv n <- c0 or c1 or c2 or c3;
  console.log ('one of [c0 c1 c1 c3]: ' + n);
}

go {
  recv m <- c3;
  console.log ('only c3: ' + m);
}
