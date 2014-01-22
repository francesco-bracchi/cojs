var chan = require ('./src/channel.js');

var wait = function (ms, val) {
    var ch = chan(1);
    setTimeout(function () {
	go { 
	    send val -> ch; 
	    console.log ('sent ' + val);
	    send val + ' second' -> ch; 
	    console.log ('sent ' + val + ' second');
	    send val + ' third' -> ch; 
	    console.log ('sent ' + val + ' third');
	} 
    });
    return ch;
};

var ch = wait(5000, "ciccio");

go while (true) {
    recv msg <- ch;
    console.log ('received ' + msg);
};

// var getConnection (url, user, pass) {
//     var ch = chan ();
//     db.connect(url, user, pass, function (con) {
// 	go send con -> ch;
//     })
//     return ch;
// }
// var queue = function (size) {
//     var ch = chan (size);
//     go while (true) {
// 	recv conn <- getConnection();
// 	send conn -> ch;
//     }
//     return ch;
// }

// var new_connection = queue (10);

// go {
//     recv conn <- new_connection;
//     recv stmt <- prepare_statement(conn, "SELECT * FROM WHERE name = (?)");
//     recv results <- execute (stmt, "ciccio");
//     while (! results.closed()) {
// 	recv row <- results;
// 	console.log (row);
//     }
// }
