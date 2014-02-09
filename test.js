'use strict';
var Queue = require ('./src/lib/queue');

var q = new Queue ();

console.log (q);
q.enq(0);
console.log (q);
q.enq(1);
console.log (q);
q.deq();
console.log (q);
q.deq();
console.log (q);
q.deq();
console.log (q);
