# Cojs

This Library is heavily inspired by 

[clojure.core.async](http://clojure.com/blog/2013/06/28/clojure-core-async-channels.html).

and the Haskell mvars;

**This library doesn't make use generators or promises, but a walker is implemented, that
rewrites fork blocks, thanks to [sweetjs](http://sweetjs.org/) macros**

# Install

## Prerequisites 

Install [sweetjs](http://sweetjs.org/) 

    npm install -g sweetjs

## Install

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

Some more examples are implemented in the /examples dir

# TODO

## features to be completed

1. enable switch statement support in act expressions
1. enable continue/break in act expressions
1. enable finally clause in try expressions.
1. **test**, **test**, **test**
