// Classical simple circular queue of fixed size
var CircularQueue = function (size) {
  this.size = size;
  this.data = new Array (size);
  this.front = 0;
  this.rear = 0;
  this.isfull = false;
};

CircularQueue.prototype.enq = function (v) {
  if (this.isfull) {
    throw new Error ('queue is full');
  }
  this.front = ++ this.front % this.size;
  this.data[this.front] = v;
  this.isfull = this.front == this.rear;
  return this;
};

CircularQueue.prototype.deq = function () {
  if (this.isfull) {
    this.isfull = false;
  }
  this.rear = ++ this.rear % this.size;
  return this.data [this.rear];
};

CircularQueue.prototype.empty = function () {
  return this.front == this.rear && !this.isfull;
};

CircularQueue.prototype.full = function () {
  return this.isfull;
};

module.exports = CircularQueue;
