# Examples

## Ping

Simple example of 2 threads exchanging the same message n times

### Run

compile cojs (from cojs root).

    > gulp ping
    > node dist/examples/ping

## Ring

Build a ring of n threads and run a message along the ring m times
where m is 1000000 / n (one million divided by n).

n should be <= 1000000.

### Run

compile cojs (from cojs root). `<n>` is optional (by default is 1000)

    > gulp ring
    > node dist/examples/ring <n>

## Browser repl

This is a simple example of the use of cojs in client context.

The interesting part is the `read()` function that blocks until
a new balanced expression is gathered from the keyboard.

The event `"keypress"` push characters to an mvar, that is consumed
by the function `getCh()` that is consumed by `getLine()` that is
consumed by `read()`.

This example relies on [browserify]{http://browserify.org/}.

### Run

compile cojs (from cojs root), and point your browser to the index file

    > gulp browser-repl
    > firefox dist/examples/browser-repl/index.html

