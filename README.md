# Cojs

This Library is heavily inspired by 

[clojure.core.async](http://clojure.com/blog/2013/06/28/clojure-core-async-channels.html).

and the Haskell mvars;

It tries to fulfill 2 objectives

1. express application logic in a linear manner, i.e. not scattered in multiple callbacks,
and avoid the "callback hell",

2. let exceptions to be raised/catched in a natural way, even if the body of the controlled code is 
split in 2 by a callback.

**This library doesn't make use generators or promises, but a walker is implemented, that
rewrites fork blocks, thanks to the power of [sweetjs](http://sweetjs.org/) macros**

# Install

    npm install cojs

## Use

    sjs -m cojs/macros <file>.js

## example  

    require ('cojs');
    var mvar = require('cojs/mvar');

    var ch = mvar(),
        m = 80000,
        n = 0;

    fork {
      while (true) {
        val v = ?ch;
        console.log ('received 1: ' + v);
      }
    }

    fork { 
      while (true) {
        val v = ?ch;
        console.log ('received 2: ' + v);
      }
    }

    fork {
      while (n < m) {
        ch ! n;
        console.log ('sent: ' + n);
        n++;
      }
    }


# TODO

## features to be completed

1. enable switch statement support in act expressions
1. enable continue/break in act expressions
1. enable finally clause in try expressions.
1. **test**, **test**, **test**

## Channels

## Performance

TBD

## Test

TBD
