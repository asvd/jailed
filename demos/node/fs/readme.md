# Filesystem demo

This example demonstrates a plugin provided with a restricted access
to the filesystem. The plugin may only create, read, update and delete
a single file (`log.txt`). A method for printing a message is
additionally exported for the demonstration purposes.


To launch this demo, first clone the repo:

```sh
$ git clone https://github.com/asvd/jailed
```

and then run with Node.js:

```sh
$ node jailed/demos/node/fs/start.js
```

You will then get an output produced by a plugin explaining in details
what is going on:

```sh
$ nodejs node/fs/start.js

=== Logfile content start: ===

New message added by the plugin on Wed Aug 27 2014 01:50:49 GMT+0200 (CEST)
New message added by the plugin on Wed Aug 27 2014 01:51:07 GMT+0200 (CEST)

=== Logfile content end ===

Logfile will be removed in 3 seconds
Removing logfile...
Logfile removed! Will be recreated in 3 seconds
Creating an empty log file
Empty logfile created, will be filled with content in 3 seconds
Writing the old content into the log file along with a new message added
Logfile updated
Plugin finished
```
