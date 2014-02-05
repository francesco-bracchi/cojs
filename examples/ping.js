var gozilla = require ('./src');

var c0 = gozilla.chan(),
    c1 = gozilla.chan();

go {
  while (true) {
    recv m <- c0;
    console.log ('ping');
    send m + 1 -> c1;
  }
  c0.close();
}

go {
  while (true) {
    recv m <- c1;
    console.log ('pong');
    send m + 1 -> c0;
  }
  c1.close();
}

go send 0 -> c0;
