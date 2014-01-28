# todo

## features

1. add try catch
2. add if 
3. add do { ... } while (test)
4. add switch
5. add continue/break

## performance
1. Move from 

    monad = function (fn) { return new Monad (fn); }

to

    monad = function (fn) { fn.run = run; return fn };

(do not create an unused wrapper object) and test performance
or even

    macro monad {
      rule {
        monad ($f:ident (,) ...) $e
      } => {
        function ($f (,) ...) { return $e }
      }
    }

and define an external run (define it on coroutine wrapper)

2. do the same for jumps
