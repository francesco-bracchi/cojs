'use strict';

var chan = require('gozilla/chan'),
    mvar = require('gozilla/mvar');

var c = chan();

go {
  take m <- c;
  console.log('took ' + m);
}

go {
  take m <- c;
  console.log('took ' + m);
}

go {
  put 10 -> c;
  put 20 -> c;
}

go {
  console.log ('10');
}
