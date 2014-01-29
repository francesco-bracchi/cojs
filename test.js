var async = require ('./src/index.js');

var m = 100, n = 0, ch = async.chan();

go {
    console.log ('pre');
    while (n < m) {
	console.log ('pre send');
	send n -> ch;
	console.log ('post send');
	n++;
    }
    console.log ('post');
};

go do {
    console.log ('pre number');
    recv v <- ch;
    console.log ('new number: ' + v);
} while (true);

