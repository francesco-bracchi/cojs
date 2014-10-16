# Cojs

This Library is heavily inspired by 

[clojure.core.async](http://clojure.com/blog/2013/06/28/clojure-core-async-channels.html).

and the Haskell mvars;

**This library doesn't make use generators or promises, but a walker is implemented, that
rewrites fork blocks, thanks to [sweetjs](http://sweetjs.org/) macro system**

# Install

## Prerequisites 

Install [sweetjs](http://sweetjs.org/) 

    npm install -g sweetjs

## Install

    npm install cojs

## Use

    sjs -m cojs/macros <file>.js

## example  

    var mvar = require('cojs/mvar');

    var ch = mvar(),
        m = 80000,
        n = 0;

    fork {
      while (true) {
        val v <~ ch;
        console.log ('received 1: ' + v);
      }
    }

    fork { 
      while (true) {
        val v <~ ch;
        console.log ('received 2: ' + v);
      }
    }

    fork {
      while (n < m) {
        ch ~> n;
        console.log ('sent: ' + n);
        n++;
      } 
    } 

Some more examples are implemented in the /examples dir

## modules

### cojs/mvar

### cojs/chan 

### cojs/throwErr
wrapper around a channel that throws an error if the returned value is an `instanceof Error`

### tasks

#### cojs/tasks/timeout

#### cojs/tasks/split

#### cojs/tasks/slurp

# TODO

## features to be completed

1. enable switch statement support in action expressions
1. enable continue/break in action expressions
1. wrap all `_while_`, `_finally_` ... second arguments in a function.
   this is needed because the content has to be evaluated at the `run` time
1. **test**, **test**, **test**
