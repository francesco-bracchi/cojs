var Buffer = require ('./circularBuffer'),
    // BufferedChannel = require ('./bufferedChannel'),
    UnbufferedChannel = require ('./unbufferedChannel');

var chan = function (size) {
  if (typeof size === 'number' && size > 0) {
    return chan (new Buffer (size));
  }
  if (size instanceof Buffer) {
    return new BufferedChannel (size);
  }
  return new UnbufferedChannel();
};

module.exports = chan;
