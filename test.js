'use strict';

var chan = require ('gozilla/chan'),
    timeout = require ('gozilla/channels/timeout');

console.log ('start');
go {
  var t0 = 1000 * Math.random(),
      t1 = 1000 * Math.random(),
      c0 = timeout (t0, 'zero'),
      c1 = timeout (t1, 'one');
  recv a <- c0 or c1;
  recv b <- c0 or c1;
  console.log ('found: ' + a + ' then ' + b);
}
