var Pair = function (head, tail) {
  this.car = head;
  this.cdr = tail;
}

var LinkedListBuffer = function () {
  this.head = undefined;
  this.tail = undefined;
  this.size = 0;
};

LinkedListBuffer.prototype.empty = function () {
  return this.tail === undefined;
};

LinkedListBuffer.prototype.enq = function (e) {
  var p = new Pair(e);
  if (this.tail) {
    this.tail.cdr = p;
    this.tail = p;
  }
  else {
    this.head = this.tail = p;
  }
  this.size++;
};

LinkedListBuffer.prototype.deq = function () {
  if (this.head === undefined) return undefined;
  var res = this.head.car;
  if (this.head === this.tail) {
    this.head = this.tail = undefined;
  }
  else {
    this.head = this.head.cdr;
  }
  this.size--;
  return res;
};

module.exports = LinkedListBuffer;
