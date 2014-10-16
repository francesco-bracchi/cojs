'use strict';
/**
 * This is a simple javascript repl, that transforms the 
 * evented loop of javascript in a plain REPL loop.
 *
 * The scope is to transform the `'keypress'` event in a 
 * channel of chars. This channel is consumed by a 
 * "computing unit" that transforms the stream of characters
 * in a stream of strings,
 * and another computing unit that transform a channel of 
 * strings in a channel of balanced expressions.
 * this last channel is read by the actual REPL loop.
 */
var mvar = require("../../../src/mvar");

// simple utility method that removes the last character
String.prototype.pop = function () {
  return this.substring(0, this.length - 1);
};

// channel that is fed by the keypress event 
var chars = mvar();

// utility function that moves the scroll to the end of
// the page where the action will take place
var gotoEnd = function () {
  document.location='#end';
};

var keys = {
  'Enter': '\n',
  'Backspace': '\b'
};

// register the callback to the 'keypress' event.
// the callback feeds the `chars` channel with the 
// newly pressed channels
var registerKeypress = function () {
  $('body').keypress(function (e) {
    var ch = keys[e.key];
    if (! ch)
      ch = String.fromCharCode(e.charCode);

    fork { ch ~> chars; }
  });
};

var id = 0;

// appends an new block to the page 
// blocks are numbered in progressive manner
var block = function (type) {
  var b = $('<pre></pre>')
        .addClass(type)
        .attr("id", ++id)
        .appendTo('#repl');
  gotoEnd();
  return b;
};

// simply append the character c in the dom,
// except in case of backspace. In this case the
// lat character is removed.
var echo = function (c, dom) {
  var txt = dom.text();

  if (c === "\b") {
    txt = txt.pop();
  }
  else {
    txt = txt + c;
  }
  dom.text(txt);
  gotoEnd();
};

//  wrapper around the `chars` channel.
// it echoes the new character in the `dom` element.
var getChar = function (dom) {
  var charV = mvar();
  fork {
    var ch <~ chars;
    echo (ch, dom);
    ch ~> charV;
  }
  return charV;
};

// read data with `getChar` until a newline happens
var getLine = function (dom) {
  var lineV = mvar(),
      line = '',
      ch;
  fork {
    do {
      ch <~ getChar(dom);
      line = ch === "\b" ? line.pop() : line + ch;
    } while (ch !== "\n");
    line ~> lineV;
  }
  return lineV;
}

// check if the string `expr` contains a balanced set of brackets
var isBalanced = function (expr) {
  var b = 0, j = 0;
  while (j < expr.length) {
    var c = expr.charAt(j);
    if ('{[('.indexOf(c) >= 0) b++;
    if ('}])'.indexOf(c) >= 0) b--;
    j++;
  }
  return b === 0;
};

// read function. the "R" of "REPL".
// it returns an mvar that is filled only when a 
// balanced expression is composed.
var read = function () {
  var exprV = mvar(),
      expr = '',
      dom = block('read');
  fork {
    do {
      var line <~ getLine(dom);
      expr += line;
    } while (!isBalanced(expr));
    expr ~> exprV;
  }
  return exprV;
};

// the "P" in "REPL"
// adds to the page a `div.block` element containing the result.
var print = function (e) {
  block('print').text('// result: ' + e);
  return e;
};

// in case the expression is not correct, an error 
// block is added instead of the print block
var error = function (e) {
  block('err').text(e);
  return e;
};

// the repl program.
// 
// 1. read an expression
// 2. eval it
// 3. print the result 
// 4. loop again
var repl = function () {
  fork {
    while (true) {
      var expr <~ read();
      try {
        print(eval(expr));
      } catch (e) {
        error('// ' + e.toString());
      }
    }
  }
};

// initializazion
// 1. registers the handler for the keypress event
// 2. starts the repl `process`
var init = function () {
  registerKeypress();
  repl();
};

$(document).ready(init);
