

    // require ('cojs');
    // var mvar = require('cojs/mvar');
    require ('./dist/src');
    var mvar = require ('./dist/src/mvar');

    var ch = mvar(),
        m = 80000,
        n = 0;

    fork {
      while (true) {
        val v = ?ch;
        console.log ('received 1: ' + v);
      }
    }

    fork { 
      while (true) {
        val v = ?ch;
        console.log ('received 2: ' + v);
      }
    }

    fork {
      while (n < m) {
        ch ! n;
        console.log ('sent: ' + n);
        n++;
      }
    }
