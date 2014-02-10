// Classical minimalistic Linked List Queue of indefinite length
var Pair = function (head, tail) {
  this.car = head;
  this.cdr = tail;
}

var LinkedListQueue = function () {
  this.head = undefined;
  this.tail = undefined;
};

LinkedListQueue.prototype.empty = function () {
  return this.tail === undefined;
};

LinkedListQueue.prototype.enq = function (e) {
  var p = new Pair(e);
  if (this.tail) {
    this.tail.cdr = p;
    this.tail = p;
  }
  else {
    this.head = this.tail = p;
  }
};

LinkedListQueue.prototype.deq = function () {
  if (this.head === undefined) return undefined;
  var res = this.head.car;
  if (this.head === this.tail) {
    this.head = this.tail = undefined;
  }
  else {
    this.head = this.head.cdr;
  }
  return res;
};

module.exports = LinkedListQueue;
