'use strict';

var chan = require ('./src/chan');

var chicco = function (t, msg) {
  var ch = chan();
  setTimeout(function () {
    go send msg -> ch;
  }, t);
  return ch;
};
 
go {
  recv m <- chicco(1000, 'uno') or chicco(3000, 'due');
  console.log ('found: ' + m);
}
