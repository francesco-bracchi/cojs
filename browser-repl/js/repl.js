require("../../../src");

var mvar = require("../../src/mvar");

// var chars = mvar();

// xxx = chars;

// // var registerKeypress = function () {
//   $('body').keypress(function (e) {
//     chars.put(String.fromCharCode(e.charCode)).run();
//   });
// // };

// var block = function (type) {
//   return $('<p>PIPPO</p>')
//     .addClass(type)
//     .appendTo('#repl');
// };

// var echo = function (c, dom) {
//   var txt = dom.text();
//   dom.text(txt + c);
// };

// var getChar = function (dom) {
//   var v = mvar();
//   fork { 
//     val c = ? chars;
//     echo (c, dom);
//     v ! c;
//   }
//   return v;
// };

// var getLine = function (dom) {
//   var v = mvar(),
//       s = '',
//       c = null;
//   fork {
//     do {
//       c = ?getChar(dom);
//       s += c;
//     } while (c !== "\n"); 
//     v ! s;
//   }
//   return v;
// }

// var isBalanced = function (s) {
//   var b = 0, j = 0;
//   while (j < s.length) {
//     var c = s.charAt(j);
//     if (c === '{') b++;
//     if (c === '}') b--;
//     j++;
//   }
//   return (b === 0);
// };

// var read = function () {
//   var s = '', v = mvar(), c,
//       dom = block('read');
//   fork {
//     do {
//       c = ? getLine(dom);
//       s += c;
//     } while (isBalanced(s));
//     v ! s;
//   }
//   return v;
// };

// var print = function (e) {
//   block('print').text(e);
//   return e;
// };

// var error = function (e) {
//   block('err').text(e);
//   return e;
// };

// var repl = function () {
//   fork {
//     while (true) {
//       val s = ?read();
//       try {
//         print(eval(s));
//       } catch (e) {
//         error(e);
//       }
//     }
//   }
// };

// fork {
//   while (true) {
//     console.log ('before');
//     val c =? chars;
//     console.log ('char:' + c);
//   }
// }

// // var init = function () {
// //   registerKeypress();
// // };

// // $(document).ready(init);
// require("./src");

// var mvar = require("./src/mvar");

var chars = mvar();

xxx = chars;

doit = function (ch) {
  fork { chars ! ch; }
};

fork {
  while (true) {
    console.log ('before');
    val c =? chars;
    console.log('char:' + c);
  }
}
