// -*- mode: js -*-

var mvar = require('./dist/src/mvar'),
    timeout = require ('./dist/src/tasks/timeout'),
    m0 = mvar(),
    m1 = mvar();

action {};

action { "foo" };

action { foo };

action { foo() };

action { "foo"; };

action { foo; };

action { foo (); };

action { 
  foo(); 
  bar();
};

action {
  var x = 10;
  foo(x);
};

action {
  var x = a;
  foo(x);
};

action {
  var x = bar();
  foo(x);
};

action {
  var x = 10, y = bar();
  foo (x,y);
};

action {
  var x <~ m0;
  foo(x);
};

action {
  var x <~ timeout(20);
  foo(x);
};

action {
  var x <~ m0, y = 20; 
  foo(x,y);
};

action {
  var x <~ foo(10), 
      y = 20; 
  foo(x,y);
};


action { 10 ~> m0 };

action { c ~> m0 };

action { 3+4 ~> m0 };

action { 2 ~> foo(x) };

action { 2 ~> foo(x) };

action { a ~> foo(x) };

action { 3+4 ~> foo(x) };

action { 10 ~> bar(); };

action { 
  foo () ~> bar (); 
  baz (42);
};

action {
  if (a>=10) 
    bar(10);
};

action {
  if (a == 100) bar(10);
  foo (a);
};

action {
  if (a >= 10) {
    foo (a);
    bar (a);
  }
};

action {
  if (a >= 10) {
    foo (a);
    bar (a);
  }
  baz (100);
};

action {
  if (a >= 10) 
    foo (a);
  else 
    baz (b);
};

action {
  if (a >= 10) 
    foo (a);
  else 
    baz (b);
  boo();
};

action {
  if (a >= 10) 
    foo (a);
  else {
    boo (a);
    bee (b);
  }
};

action {
  if (a >= 10) 
    foo (a);
  else {
    boo (a);
    bee (b);
  }
  baz ();
};

action {
  if (a >= 10) {
    foo (a);
    bar (b);
  }
  else 
    baz (c);
};

action {
  if (a >= 10) {
    foo (a);
    bar (b);
  }
  else 
    baz (c);
  finals ();
};


action {
  if (a >= 10) {
    foo (a);
    bar (b);
  }
  else {
    too (a);
    mar (b);
  }
};

action {
  if (a >= 10) {
    foo (a);
    bar (b);
  }
  else {
    too (a);
    mar (b);
  }
  finals ();
};

action {
  a <~ m0;
  foo();
};

action {
  a <~ foo();
  foo ();
};

action {
  while (a < 10) 
    a++ ;
};

action {
  while (a >= 10) 
    a++ ;
  finals();
};

action {
  while (a >= 10) {
    a++ ;
    console.log('a:' + a);
  }
};

action {
  while (a >= 10) {
    a++ ;
    console.log('a:' + a);
  }
  finals();
};

action {
  do foo()
  while (a >= 10)
}

action {
  do foo()
  while (a >= 10);
}

action {
  do foo()
  while (a >= 10);
  finals();
};

action {
  do {
    foo ();
    bar ();
  } while (a >= 10)
};

action {
  do {
    foo ();
    bar ();
  } while (a >= 10);
};

action {
  do {
    foo();
    bar();
  } while (a >= 10);
  finals();
};

action {
  do {
    foo();
    bar();
  } while (x <= 10)
};

action {
  try {
    foo(a,b);
    bar(c,d);
  }
  finally {
    finals();
  }
};

action {
  try {
    foo(a,b);
    bar(c,d);
  }
  catch (e) {
    console.log(e);
  }
};

action {
  try {
    foo(a,b);
    bar(c,d);
  }
  catch (e) {
    console.log(e);
  }
  finally {
    finals();
  }
};

action {
  throw 10;
};

action {
  throw a;
};

action {
  throw new Error ('error');
};

action {
  throw 10;
  unreachable();
};

action {
  throw a;
  unreachable();
};

action {
  throw new Error ('error');
  unreachable();
};

action {
  throw new Error ('error');
  unreachable();
};

action {
  for (j = 0 ; j < a.length ; j++) 
    console.log(j);
};

action {
  for (var j = 0 ; j < a.length ; j++) 
    console.log(j);
};

action {
  for (j = 0 ; j < a.length ; j++) 
    console.log(j);
  console.log('finally');
};

action {
  for (var j = 0 ; j < a.length ; j++) 
    console.log(j);
  console.log('finally');
};

action {
  for (j = 0 ; j < a.length ; j++) {
    foo();
    bar();
  }
};

action {
  for (var j = 0 ; j < a.length ; j++) {
    foo();
    bar();
  }
};

action {
  for (j = 0 ; j < a.length ; j++) {
    foo();
    bar();
  }
  console.log('finally');
};

action {
  for (var j = 0 ; j < a.length ; j++) {
    foo();
    bar();
  }
  console.log('finally');
};

action {
  for ( ; j < a.length ; j++) 
    foo();
};

action {
  for ( ; j < a.length ; j++) {
    foo();
    bar();
  }
};

action {
  for ( ; j < a.length ; j++) 
    foo();
  console.log('finally');
};

action {
  for ( ; j < a.length ; j++) {
    foo();
    bar();
  }
  console.log('finally');
};

action {
  for (j = 0 ; ; j++) foo ();
};

action {
  for (j = 0 ; ; j++) foo ();
  console.log('final');
};

action {
  for (j = 0 ; ; j++) {
    foo ();
    bar();
  }
  console.log('final');
};

action {
  for (var j = 0 ; ; j++) 
    console.log(j);
};

action {
  for (j = 0 ; ; j++) 
    console.log(j);
  console.log('finally');
};

action {
  for (var j = 0 ; ; j++) 
    console.log(j);
  console.log('finally');
};

action {
  for (;;) {
    console.log ('forever');
    var c <~ ch0;
  }
};

action {
  for (var i in obj) {
    console.log(obj[i]);
  }
};

action {
  for (var i in obj)
    console.log(obj[i]);
};

// action {
//   return 10;
// };

// action {
//   return;
// };

// action {
//   break action;
// };

// action {
//   break;
// };

// action {
//   continue action;
// };

// action {
//   continue;
// };

// action {
//   switch (c) {
//   case 0: 
//     foo();
//     break;
//   default:
//     bar();
//   }
// }
