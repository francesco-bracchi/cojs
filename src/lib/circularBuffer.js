var CircularBuffer = function (size) {
  this.size = size;
  this.data = new Array (size);
  this.front = 0;
  this.rear = 0;
  this.isfull = false;
};

CircularBuffer.prototype.enq = function (v) {
  if (this.isfull) {
    throw new Error ('buffer is full');
  }
  this.front = ++ this.front % this.size;
  this.data[this.front] = v;
  this.isfull = this.front == this.rear;
};

CircularBuffer.prototype.deq = function () {
  if (this.isfull) {
    this.isfull = false;
  }
  this.rear = ++ this.rear % this.size;
  return this.data [this.rear];
};

CircularBuffer.prototype.empty = function () {
  return this.front == this.rear && !this.isfull;
};

CircularBuffer.prototype.full = function () {
  return this.isfull;
};

module.exports = CircularBuffer;
