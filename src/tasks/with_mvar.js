var mvar = require ('../mvar');

var with_mvar = function (fun) {
  var mv = mvar();
  fun (mv);
  return mv;
};

module.exports = with_mvar;
