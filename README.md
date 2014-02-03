# Async js

This Library is heavily inspired by 
[clojure.core.async](http://clojure.com/blog/2013/06/28/clojure-core-async-channels.html).

It tries to fulfill 2 objectives

1. express application logic in a linear manner, i.e. not scattered in multiple callbacks,
and avoid the "callback hell",

2. let exceptions to be raised/catched in a natural way, even if the body of the controlled code is 
split in 2 by a callback.

**This library doesn't make use generators or promises, but a walker is implemented, that
rewrites go blocks, thanks to the power of [sweetjs](http://sweetjs.org/) macros**

# Install

TBD

## Use

## example  

    var gozilla = require ('gozilla');
   
    var ch = gozilla.chan(),
        m = 80000,
        n = 0;

    go try {
      while (true) {
        recv v <- ch;
        console.log ('received 1: ' + v);
      }
    } catch (ex) {
      console.log ('channel closed');
    }

    go try { 
      while (true) {
        recv v <- ch;
        console.log ('received 2: ' + v);
      }
    } catch (ex) {
      console.log ('channel closed');
    }

    go {
      while (n < m) {
        send n -> ch;
        console.log ('sent: ' + n);
        n++;
      }
      ch.close();
    }


## todo

## features

1. add switch
1. add continue/break
1. finally to the try catch block

## Channels

1. implement alt operation
1. implement different buffer strategies
## Performance

TBD

## Test

TBD

# install

## Node

TBD

## requirejs

TBD

## google closure library

TBD

## Plain javascript

TBD
