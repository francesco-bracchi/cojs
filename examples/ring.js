'use strict';

var gozilla = require ('./src');

var now = function () {
  return (new Date()).getTime();
};

var printTime = function (fun) {
  var t0 = now();
  var c = fun();
  var t = now();
  console.log ('time: ' + (t - t0) + 'ms');
  return c;
};

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
        // console.log ('process: ' + j + ', message: ' + m);
        send k -> neighbor (j);
        m++;
      }
    }
    return ch;
  };

  console.log ('initializing processes');
  for (var j = 0; j < n0; j++) 
    channels[j] = initChannel (j);
  console.log ('processes initialized'); 

  printTime (function () {
    go send "go" -> channels[0];
  });
};


var getN = function () {
  return parseInt(process.argv[2]);
};

var n = getN(),
    m = 1000000 / n;

console.log ("There are " + n + " processes organized in a ring");
console.log ("A message will go around the ring " + m + " times");
main (n, m); 
