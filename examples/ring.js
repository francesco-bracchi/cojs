// classical ring example.
// the app is configured in a ring of processes and a message 
// that is run in the circle.

'use strict';

var chan = require ('./src/chan');

var now = function () {
  return (new Date()).getTime();
};

var time = function (fun) {
  var t0 = now();
  var c = fun();
  var t = now();
  return (t - t0);
  return c;
};

var main = function (n0, m0) {
  var channels = [];
  
  var neighbor = function (j) {
    var i = (j + 1) % n0;
    return channels[i];
  };
  
  var initChannel = function (j) {
    var ch = chan(), 
        m = 0;
    go {
      while (m < m0) {
        recv k <- ch;
        // console.log ('n:' + j + ' m:' + m);
        send k -> neighbor(j);
        m++;
      }
      neighbor(j).close();
    }
    return ch;
  };
  
  var init_t = time (function () {
    for (var j = 0; j < n0; j++) 
      channels[j] = initChannel (j);
  });
  console.log('processes initialized in ' + init_t + 'ms (' + (init_t / n) + 'ms per process)');
  var exec_t = time (function () { 
    go send "go" -> channels[0];
  });
  console.log('process run in ' + exec_t + 'ms (' + exec_t / (m * n) + 'ms per message)');
};

var getN = function () {
  return parseInt(process.argv[2]);
};

var n = getN();
if (n) {
  var m = 1000000 / n;
  console.log ('There ' + (n <= 1 ? 'is' : 'are' ) + ' ' + n + ' process' + (n <= 1 ? '' : 'es') + ' organized in a ring');
  console.log ('A message will go around the ring ' + m + ' time' + (m <= 1 ? '' : 's'));
  console.log ('total time: ' +  time (function () { main (n, m); }) + 'ms');
} else {
  console.log ('usage: ');
  console.log ('node ring.js <n>');
  console.log ('Where <n> is the number of concurrent processes (0 < n <= 1000000)');
}
