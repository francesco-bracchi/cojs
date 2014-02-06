'use strict';
var gozilla = require ('./src');

var main = function (n0, m0) {
  var channels = [];

  var neighbor = function (j) {
    var i = (j + 1) % n0;
    return channels[i];
  };

  var initChannel = function (j) {
    var ch = gozilla.chan(), 
        m = 0;
    go {
      while (m < m0) {
        recv k <- ch;
        // console.log ('passing by ' + j + ' (' + k + ')');
        send k + 1 -> neighbor (j);
        m++;
      }
    }
    return ch;
  };

  for (var j = 0; j < n0; j++) 
    channels[j] = initChannel (j);
  
  var x = go send 0 -> channels[0];
};

var n = 100000;

var now = function () {
  return (new Date()).getTime();
};

var printTime = function (fun, exp) {
  var t0 = now();
  var c = fun();
  var t = now();
  console.log (exp);
  console.log ('time: ' + (t - t0) + 'ms');
  return c;
};

printTime(function () {
  main (n, 1000000 / n);
});
