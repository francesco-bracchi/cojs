
var mvar = require('./src/mvar'),
    core = require('./src/core');

var box = mvar();

fork {
  do! a = c.take();
  box! 10;
  recv a = box;
  // c <- "message"
  // ( var ) v = <- c;
}
