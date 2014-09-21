# Timeout demo
 
Performs a heavy calculation within a plugin, controls the execution
time. The Plugin runs in a separate and restricted process which has
no access to the external environment, it only provides a method to
perform the calculation. If the calculation is not completed within a
timeout, the Plugin process is terminated. This approach may be used
for the untrusted code which may become too slow or even fall into an
infinite loop.

To launch this demo, first clone the repo:

```sh
$ git clone https://github.com/asvd/jailed
```

and then run with Node.js:

```sh
$ node jailed/demos/node/timeout/start.js
```

The plugin calculates the Fibonacci number (40th by default), you may
provide a custom argument:

```sh
$ node jailed/demos/node/timeout/start.js 50
```

(The number of 50 probably will not be calculated on time)

