'use strict';

var mvar = require("../../../src/mvar");

var chars = mvar();

var gotoEnd = function () {
  document.location='#end';
};

var registerKeypress = function () {
  $('body').keypress(function (e) {
    var ch;
    if (e.key == 'Enter') {
      ch = "\n";
    } 
    else if (e.key == 'Backspace') {
      ch = "\b";
    }
    else {
      ch = String.fromCharCode(e.charCode);
    }
    fork { chars ! ch }
  });
};

var id = 0;

var block = function (type) {
  var b = $('<pre></pre>')
        .addClass(type)
        .attr("id", ++id)
        .appendTo('#repl');
  gotoEnd();
  return b;
};

var echo = function (c, dom) {
  var txt = dom.text();
  
  if (c === "\b") {
    txt = txt.substring(0, txt.length - 1);
  }
  else {
    txt = txt + c;
  }
  dom.text(txt);
  gotoEnd();
};

var getChar = function (dom) {
  var v = mvar();
  fork { 
    val c = ? chars;
    echo (c, dom);
    v ! c;
  }
  return v;
};

var getLine = function (dom) {
  var v = mvar(),
      s = '',
      c = null;
  fork {
    do {
      c = ?getChar(dom);
      s = c === "\b" ? s.substring(0, s.length - 1) : s + c;
    } while (c !== "\n"); 
    v ! s;
  }
  return v;
}

var isBalanced = function (s) {
  var b = 0, j = 0;
  while (j < s.length) {
    var c = s.charAt(j);
    if ('{[('.indexOf(c) >= 0) b++;
    if ('}])'.indexOf(c) >= 0) b--;
    j++;
  }
  return (b === 0);
};

var read = function () {
  var s = '', v = mvar(), c,
      dom = block('read');
  fork {
    do {
      c = ? getLine(dom);
      s += c;
    } while (!isBalanced(s));
    v ! s;
  }
  return v;
};

var print = function (e) {
  block('print').text('// result: ' + e);
  return e;
};

var error = function (e) {
  block('err').text(e);
  return e;
};

var repl = function () {
  fork {
    while (true) {
      val s = ?read();
      try {
        print(eval(s));
      } catch (e) {
        error(e);
      }
    }
  }
};

var init = function () {
  registerKeypress();
  repl();
};

$(document).ready(init);

