'use strict';
// This module contains the basic monad constructors.

var Action = require ('./action'),
    Trampoline = require ('./trampoline');

module.exports = {
  ret: Action.ret,
  retU: Action.retU,
  fail: Action.fail,
  failU: Action.failU,
  undef: Action.retU()
};
