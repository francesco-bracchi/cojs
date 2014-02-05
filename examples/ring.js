var gozilla = require ('./src');

var main = function (m0, n0) {
  var channels = [];

  var neighbor = function (j) {
    var i = (j + 1) % n0;
    return channels[i];
  };

  var initChannel = function (j) {
    var ch = gozilla.chan(), 
        m = 0;

    go {
      while (m < m0) {
        recv m <- ch;
        console.log ('passing by ' + j + ' (' + m + ')');
        send m + 1 -> neighbor (j);
      }
      ch.close();
    }
    return ch;
  };

  for (var j = 0; j < n0; j++) 
    channels[j] = initChannel (j);
  
  var x = go send 0 -> channels[0] ;

  console.log (channels);
};

main (10, 3);
