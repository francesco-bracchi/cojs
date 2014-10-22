var assert = require('assert'),
    sweet = require('sweet.js'),
    core = require('../lib/core'),
    Queue = require ('../lib/linkedListQueue'),
    fs = require('fs');

describe ('Macro expansion', function () {
  sweet.loadMacro('./build/lib/macros');

  it('expands empty', function () {
    sweet.compile(["action {};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action { 'foo' };"].join('\n'));
  });    
  it('expand', function () {
    sweet.compile(["action { foo };"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action { foo() };"].join('\n'));
  });  
  it('expand', function () {
    sweet.compile(["action { 'foo'; };"].join('\n'));
  });  
  it('expand', function () {
    sweet.compile(["action { foo; };"].join('\n'));
  });  
  it('expand', function () {
    sweet.compile(["action { foo (); };"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  foo(); ",
                   "  bar(); ",
                   "}; "].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  var x = 10;",
                   "  foo(x);",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  var x = a;",
                   "  foo(x);",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  var x = bar();",
                   "  foo(x);",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  var x = 10, y = bar();",
                   "  foo (x,y);",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  var x <~ m0;",
                   "  foo(x);",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  var x <~ timeout(20);",
                   "  foo(x);",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  var x <~ m0, y = 20; ",
                   "  foo(x,y);",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  var x <~ foo(10), ",
                   "      y = 20; ",
                   "  foo(x,y);",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action { 10 ~> m0 };"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action { c ~> m0 };"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action { 3+4 ~> m0 };"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action { 2 ~> foo(x) };"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action { 2 ~> foo(x) };"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action { a ~> foo(x) };"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action { 3+4 ~> foo(x) };"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action { 10 ~> bar(); };"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action { ",
                   "  foo () ~> bar (); ",
                   "  baz (42);",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  if (a>=10) ",
                   "    bar(10);",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  if (a == 100) bar(10);",
                   "  foo (a);",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  if (a >= 10) {",
                   "    foo (a);",
                   "    bar (a);",
                   "  }",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  if (a >= 10) {",
                   "    foo (a);",
                   "    bar (a);",
                   "  }",
                   "  baz (100);",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  if (a >= 10) ",
                   "    foo (a);",
                   "  else ",
                   "    baz (b);",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  if (a >= 10) ",
                   "    foo (a);",
                   "  else ",
                   "    baz (b);",
                   "  boo();",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  if (a >= 10) ",
                   "    foo (a);",
                   "  else {",
                   "    boo (a);",
                   "    bee (b);",
                   "  }",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  if (a >= 10) ",
                   "    foo (a);",
                   "  else {",
                   "    boo (a);",
                   "    bee (b);",
                   "  }",
                   "  baz ();",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  if (a >= 10) {",
                   "    foo (a);",
                   "    bar (b);",
                   "  }",
                   "  else ",
                   "    baz (c);",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  if (a >= 10) {",
                   "    foo (a);",
                   "    bar (b);",
                   "  }",
                   "  else ",
                   "    baz (c);",
                   "  finals ();",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  if (a >= 10) {",
                   "    foo (a);",
                   "    bar (b);",
                   "  }",
                   "  else {",
                   "    too (a);",
                   "    mar (b);",
                   "  }",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  if (a >= 10) {",
                   "    foo (a);",
                   "    bar (b);",
                   "  }",
                   "  else {",
                   "    too (a);",
                   "    mar (b);",
                   "  }",
                   "  finals ();",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  a <~ m0;",
                   "  foo();",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  a <~ foo();",
                   "  foo ();",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  while (a < 10) ",
                   "    a++ ;",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  while (a >= 10) ",
                   "    a++ ;",
                   "  finals();",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  while (a >= 10) {",
                   "    a++ ;",
                   "    console.log('a:' + a);",
                   "  }",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  while (a >= 10) {",
                   "    a++ ;",
                   "    console.log('a:' + a);",
                   "  }",
                   "  finals();",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  do foo()",
                   "  while (a >= 10)",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  do foo()",
                   "  while (a >= 10);",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  do foo()",
                   "  while (a >= 10);",
                   "  finals();",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  do {",
                   "    foo ();",
                   "    bar ();",
                   "  } while (a >= 10)",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  do {",
                   "    foo ();",
                   "    bar ();",
                   "  } while (a >= 10);",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  do {",
                   "    foo();",
                   "    bar();",
                   "  } while (a >= 10);",
                   "  finals();",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  do {",
                   "    foo();",
                   "    bar();",
                   "  } while (x <= 10)",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  try {",
                   "    foo(a,b);",
                   "    bar(c,d);",
                   "  }",
                   "  finally {",
                   "    finals();",
                   "  }",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  try {",
                   "    foo(a,b);",
                   "    bar(c,d);",
                   "  }",
                   "  catch (e) {",
                   "    console.log(e);",
                   "  }",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  try {",
                   "    foo(a,b);",
                   "    bar(c,d);",
                   "  }",
                   "  catch (e) {",
                   "    console.log(e);",
                   "  }",
                   "  finally {",
                   "    finals();",
                   "  }",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  throw 10;",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  throw a;",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  throw new Error ('error');",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  throw 10;",
                   "  unreachable();",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  throw a;",
                   "  unreachable();",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  throw new Error ('error');",
                   "  unreachable();",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  throw new Error ('error');",
                   "  unreachable();",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  for (j = 0 ; j < a.length ; j++) ",
                   "    console.log(j);",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  for (var j = 0 ; j < a.length ; j++) ",
                   "    console.log(j);",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  for (j = 0 ; j < a.length ; j++) ",
                   "    console.log(j);",
                   "  console.log('finally');",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  for (var j = 0 ; j < a.length ; j++) ",
                   "    console.log(j);",
                   "  console.log('finally');",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  for (j = 0 ; j < a.length ; j++) {",
                   "    foo();",
                   "    bar();",
                   "  }",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  for (var j = 0 ; j < a.length ; j++) {",
                   "    foo();",
                   "    bar();",
                   "  }",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  for (j = 0 ; j < a.length ; j++) {",
                   "    foo();",
                   "    bar();",
                   "  }",
                   "  console.log('finally');",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  for (var j = 0 ; j < a.length ; j++) {",
                   "    foo();",
                   "    bar();",
                   "  }",
                   "  console.log('finally');",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  for ( ; j < a.length ; j++) ",
                   "    foo();",
                   "};",
                   "action {",
                   "  for ( ; j < a.length ; j++) {",
                   "    foo();",
                   "    bar();",
                   "  }",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  for ( ; j < a.length ; j++) ",
                   "    foo();",
                   "  console.log('finally');",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  for ( ; j < a.length ; j++) {",
                   "    foo();",
                   "    bar();",
                   "  }",
                   "  console.log('finally');",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  for (j = 0 ; ; j++) foo ();",
                   "};",
                   "action {",
                   "  for (j = 0 ; ; j++) foo ();",
                   "  console.log('final');",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  for (j = 0 ; ; j++) {",
                   "    foo ();",
                   "    bar();",
                   "  }",
                   "  console.log('final');",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  for (var j = 0 ; ; j++) ",
                   "    console.log(j);",
                   "};"].join('\n'));
  });

  it('expand', function () {
    sweet.compile(["action { ",
                   "  for (j = 0 ; ; j++) ",
                   "    console.log(j); ",
                   "  console.log('finally');",
                   "};"].join('\n'));
  });
  
  it('expand', function () {
    sweet.compile(["action {",
                   "  for (var j = 0 ; ; j++) ",
                   "    console.log(j);",
                   "  console.log('finally');",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  for (;;) {",
                   "    console.log ('forever');",
                   "    var c <~ ch0;",
                   "  }",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  for (var i in obj) {",
                   "    console.log(obj[i]);",
                   "  }",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["action {",
                   "  for (var i in obj)",
                   "    console.log(obj[i]);",
                   "};"].join('\n'));
  });
  it('expand', function () {
    sweet.compile(["// action {",
                   "//   return 10;",
                   "// };"].join('\n'));
  });
  // ["// action {",
  //    "//   return;",
  //    "// };"].join('\n'));

//   ["// action {",
//    "//   break action;",
//    "// };"].join('\n'));

//   ["// action {",
//    "//   break;",
//    "// };"].join('\n'));

//   ["// action {",
//    "//   continue action;",
//    "// };"].join('\n'));

//   ["// action {",
//    "//   continue;",
//    "// };"].join('\n'));

//   ["// action {",
//    "//   switch (c) {",
//    "//   case 0: ",
//    "//     foo();",
//    "//     break;",
//    "//   default:",
//    "//     bar();",
//    "//   }",
//    "// }"].join('\n'));
});

describe('Basic monads (return fail) ', function () {
  it ('return boxed', function() {
    var value = ['value'],
        v0 = core.ret(function() { return value; }).run();
    assert(value === v0);
  });
  it ('return unboxed', function() {
    var value = ['value'],
        v0 = core.retU(value).run();
    assert(value === v0);
  });
  it ('return undefined', function() {
    var v0 = core.undef.run();
    assert(v0 === undefined);
  });

  it ('fail boxed', function() {
    var msg = 'test',
        err = new Error(msg);
    try {
      core.fail(function() { return err; }).run();
      assert(false);
    } catch (e) {
      assert(e.message === msg);
    }
  });
  it ('fail inside ret', function() {
    var msg = 'test',
        err = new Error(msg);
    try {
      core.ret(function() { throw err; }).run();
      assert(false);
    } catch (e) {
      assert(e.message === msg);
    }
  });
  it ('fail inside fail', function() {
    var msg = 'test',
        err = new Error(msg);
    try {
      core.fail(function() { throw err; }).run();
      assert(false);
    } catch (e) {
      assert(e.message === msg);
    }
  });

  it ('fail unboxed', function() {
    var msg = 'test',
        err = new Error(msg);
    try {
      core.failU(err).run();
      assert(false);
    } catch (e) {
      assert(e.message === msg);
    }
  });
});

describe ('Monad composition', function () {
  it ('monad bind', function () {
    var val = ['a'];
    core.retU(val).bind(function (x) {
      assert(x === val);
      return core.undef;
    }).run();
  });
  it ('monad sequence (then)', function () {
    var a = ['a'],
        b = ['b'];
    assert(core.retU(a).then(core.retU(b)).run() === b);
  });
  it ('monad sum (error) not triggered', function () {
    var a = ['a'];
    assert(core.retU(a).error(function (e) {
      assert(false);
      return core.undef;
    }).run() === a);
  });
  it ('monad sum (error) triggered', function () {
    var msg = 'fails',
        a = ['a'],
        err = new Error(msg);
    assert(core.failU(err).error(function (e) {
      assert (e.message === msg);
      return core.retU(a);
    }).run() === a);
  });

  it ('anyhow (finally) operator no errors', function () {
    var a = ['a'],
        b = ['b'],
        executed = false,
        result = core.retU(a).anyhow(core.ret(function () {
          executed = true;
          return b;
        })).run();
    assert (result === a && executed);
  });

  it ('anyhow (finally) operator with error', function () {
    var a = ['a'],
        b = ['b'],
        msg = 'anyhow message',
        err = new Error(msg),
        executed = false;
    try {
      core.failU(err).anyhow(core.ret(function () {
        executed = true;
        return b;
      })).run();
      assert (false);
    } catch (e) {
      assert (e.message === msg && executed);
    }
  });
});

describe('Linked list Queue', function () {
  it ('is empty', function () {
    var q = new Queue ();
    assert (q.empty());
  });
  it ('enqueue one element', function () {
    var a = ['a'],
        q = new Queue ();
    q.enq(a);
    assert (! q.empty());
  });
  it ('enqueue two elements', function () {
    var a = ['a'],
        b = ['b'],
        q = new Queue ();
    q.enq(a).enq(b);
    assert (! q.empty());
  });
  it ('dequeue', function () {
    var a = ['a'],
        b = ['b'],
        q = new Queue ();
    q.enq(a).enq(b);
    assert(q.deq() === a);
    assert(q.deq() === b);
  });
  it ('dequeue empty', function () {
    var q = new Queue ();
    assert (q.deq() === undefined);
  });
});
  // todo: test mvars, 
  // testing mvar test the branch in initial continuation
  // that resumes an active continuation activated by mvar.
  // test the rest.


