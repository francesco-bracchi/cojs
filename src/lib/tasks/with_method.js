'use strict';

var with_mvar = require ('./with_mvar');

var defaultDataMapper = function() {
  var args = Array.prototype.slice.call(arguments, 0);
  switch (args.length) {
    case 0: return null;
    case 1: return args[0];
    default: return args;
  }
};

var transformMethod = function (method, data_mapper) {
  if (! data_mapper) data_mapper = defaultDataMapper;
  return function () {
    var co_args = Array.prototype.slice.call(arguments, 0),
        self = this;
    return with_mvar(function (mvar) {
      // get the very same arguments of the returned function and push the callback at the end
      co_args.push (function () {
        var data = data_mapper.call(null, Array.prototype.slice.call(arguments, 0));
        fork { mvar ~> data; }
      });
      return method.call(self, co_args);
    });
  };
};

module.exports = transformMethod;

