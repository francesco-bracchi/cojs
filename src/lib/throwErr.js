'use strict';

// simple wrapper function around a channel. 
// if the channel returns an object of type `Error` throws
// an exception, otherwise returns the object
//
//     fork {
//       try {
//         var m <~ c;
//         if (m instanceof Error) throw m;
//         console.log('message: ', m);
//       } catch (e) {
//         console.log ('error:', e);
//       }
//     }

// whould be

//     fork {
//       try {
//         var m <~ throwErr(c);
//         console.log('message: ', m);
//       } catch (e) {
//         console.log ('error:', e);
//       }
//     }

var Action = require('./action'),
    alt = require ('./alt'),
    ret = Action.retU,
    fail = Action.failU;

var ThrowErr = function (c) {
  this.channel = c;
}

ThrowErr.prototype.take = function () {
  return this.channel.take().bind(function (e) {
    return e instanceof Error ? fail(e) : ret(e);
  });
};

ThrowErr.prototype.put = function (val) {
  return this.channel.put(val);
};

ThrowErr.prototype.alt = function (n) {
  return alt (this, n);
}

var throwErr = function (c) {
  return new ThrowErr (c);
}
