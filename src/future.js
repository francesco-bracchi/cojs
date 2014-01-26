
var Future = function (f) {
    this.force = f;
};

Future.prototype.resume = function () {
    var me = this;
    while (me instanceof Future) {
	me = me.force();
    }
    return me;
};

var future = function (fn) {
    return new Future (fn);
}

module.exports = future;
