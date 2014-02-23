var mvar = require('gozilla/mvar'),
    timeout = require ('gozilla/channels/timeout');

var c = mvar();

fork {
  while (true) {
    take m <- c or timeout(1000, "accipicchia");
    console.log ('took: ' + m);
  }
}
