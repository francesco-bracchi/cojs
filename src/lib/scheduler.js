var running = [];

var run = function () {
  while (running.length > 0)
    running.shift()();
};

var resume = function (fun) {
  running.push (fun);
};

module.exports = {
  resume: resume,
  run: run
};
