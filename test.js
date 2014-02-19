// classical ring example.
// the app is configured in a ring of processes and a message 
// that is run in the circle.
'use strict';
var mvar$562 = require('./src/mvar');
var now$563 = function () {
    return new Date().getTime();
};
var time$564 = function (fun$568) {
    var t0$569 = now$563();
    var c$570 = fun$568();
    var t$571 = now$563();
    return t$571 - t0$569;
    return c$570;
};
var main$565 = function (n0$572, m0$573) {
    var channels$574 = [];
    var neighbor$575 = function (j$579) {
        var i$580 = (j$579 + 1) % n0$572;
        return channels$574[i$580];
    };
    var initChannel$576 = function (j$581) {
        var ch$582 = mvar$562(), m$583 = 0;
        channels$574[j$581] = ch$582;
        (function (core$587) {
            return function loop() {
                return core$587.ret(function () {
                    return m$583 < m0$573;
                }).bind(function (k$593) {
                    return k$593 ? ch$582.take().bind(function (k) {
                        return neighbor$575(j$581).put(k).bind(function (_) {
                            return core$587.ret(function () {
                                return m$583++;
                            }).bind(loop);
                        });
                    }) : core$587.ret(function () {
                        return undefined;
                    });
                });
            }().run();
        }(require('./src/core')));
    };
    var init_t$577 = time$564(function () {
            for (var j$602 = 0; j$602 < n0$572; j$602++)
                initChannel$576(j$602);
        });
    console.log('processes initialized in ' + init_t$577 + 'ms (' + init_t$577 / n$567 + 'ms per process)');
    var exec_t$578 = time$564(function () {
            (function (core$607) {
                return channels$574[0].put('go').run();
            }(require('./src/core')));
            ;
        });
    console.log('process run in ' + exec_t$578 + 'ms (' + exec_t$578 / (m$610 * n$567) + 'ms per message)');
};
var getN$566 = function () {
    return parseInt(process.argv[2]);
};
var n$567 = getN$566();
if (n$567) {
    var m$610 = 1000000 / n$567;
    console.log('There ' + (n$567 <= 1 ? 'is' : 'are') + ' ' + n$567 + ' process' + (n$567 <= 1 ? '' : 'es') + ' organized in a ring');
    console.log('A message will go around the ring ' + m$610 + ' time' + (m$610 <= 1 ? '' : 's'));
    console.log('total time: ' + time$564(function () {
        main$565(n$567, m$610);
    }) + 'ms');
} else {
    console.log('usage: ');
    console.log('node ring.js <n>');
    console.log('Where <n> is the number of concurrent processes (0 < n <= 1000000)');
}
