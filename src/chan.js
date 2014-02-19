// // This function is the entry point of the module.
// //
// //     var chan = require('gozilla/chan');
// //     var ch = chan ();
// //
// // called in this variant creates an unbuffered channel
// //
// //     var ch = chan (10);
// //
// // You can pass as argument a Buffer instance. A buffer instance is an object 
// // that implements `enq` and `deq` `full` and `empty` methods. 

// var BufferedChannel = require ('./bufferedChannel'),
//     Buffer = require ('./data_structures/circularQueue'),
//     UnbufferedChannel = require ('./unbufferedChannel');

// // ### create 
// var chan = function (size) {
//   // if argument is a number, return a buffered channel of size `size`
//   if (typeof size === 'number' && size > 0) {
//     return chan (new Buffer (size));
//   }
//   // if argument is a `Buffer`, creates a channel with that buffer.
//   if (size instanceof Buffer) {
//     return new BufferedChannel (size);
//   }
//   // otherwise returns an `UnbufferedChannel`
//   return new UnbufferedChannel();
// };

// module.exports = chan;
