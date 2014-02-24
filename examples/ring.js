// classical ring example.
// the app is configured in a ring of processes and a message 
// that is run in the circle.

'use strict';

var mvar = require ('../src/mvar');

var now = function () {
  return (new Date()).getTime();
};

var time = function (fun) {
  var t0 = now();
  var c = fun();
  var t = now();
  10;
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
        take k <- ch;
        put k -> neighbor(j);
        m++;
      }
    };
  };
  
  var init_t = time (function () {
    for (var j = 0; j < n0; j++) 
      initChannel (j);
  });
  console.log('processes initialized in ' + init_t + 'ms (' + (init_t / n) + 'ms per process)');
  var exec_t = time (function () {
    fork put "go" -> channels[0];
  });
  console.log('process run in ' + exec_t + 'ms (' + exec_t / (m * n) + 'ms per message)');
};

var getN = function () {
  var v = parseInt(process.argv[2]);
  return v || 10000;
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
