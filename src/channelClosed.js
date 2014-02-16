// Channel Closed Error

var ChannelClosed = function (ch) {
  this.channel = ch;
  this.message = "Channel Closed";
  this.stack = (new Error()).stack;
};

module.exports = ChannelClosed;
