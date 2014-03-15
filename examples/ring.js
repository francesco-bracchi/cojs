// classical ring example.
// the app is configured in a ring of processes and a message 
// that is run in the circle.

'use strict';

var mvar = require ('../src/mvar'),
    core = require ('../src');

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
    var ch = mvar(), 
        m = 0;
    channels[j] = ch;
    fork {
      while (m < m0) {
        val k = ?ch;
        neighbor(j) ! k;
        m++;
      }
    };
  };
  
  var init_t = time (function () {
    for (var j = 0; j < n0; j++) 
      initChannel (j);
  });
  console.log('processes initialized in ' + init_t + 'ms (' + (1000 * init_t / n ) + 'μs per process)');
  var exec_t = time (function () {
    fork { channels[0] ! "go" }
  });
  console.log('process run in ' + exec_t + 'ms (' + 1000 * exec_t / (m * n) + 'μs per message)');
};

var getN = function () {
  var v = parseInt(process.argv[2]);
  return Math.min (1000000, Math.max (0, v || 10000));
};

var n = getN();
if (n) {
  var m = Math.ceil(1000000 / n);
  console.log ('There ' + (n <= 1 ? 'is' : 'are' ) + ' ' + n + ' process' + (n <= 1 ? '' : 'es') + ' organized in a ring');
  console.log ('A message will go around the ring ' + m + ' time' + (m <= 1 ? '' : 's'));
  console.log ('total time: ' +  time (function () { main (n, m); }) + 'ms');
} else {
  console.log ('usage: ');
  console.log ('node ring.js <n>');
  console.log ('Where <n> is the number of concurrent processes (0 < n <= 1000000)');
}
