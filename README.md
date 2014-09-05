Jailed — sandboxed plugins, custom API
======================================

Jailed is a small JavaScript library for executing an untrusted code
as a plugin in a sandboxed environment. The key feature of Jailed is
an opportunity to export a set of methods into the sandbox — thus
defining a precise set of plugin priviliges. Anything not exported
explicitly cannot be accessed: a plugin runs in a
[worker](https://developer.mozilla.org/en-US/docs/Web/Guide/Performance/Using_web_workers)
(in case of web-browser environment), or as a restricted subprocess
(in Node.js).


With Jailed you can:

- Setup a safe environment for executing an untrusted code, without a
  need to create a Worker / subprocess manually;

- Write an isomorphic code which will work unchanged both in
  web-browser and in Node.js;

- Execute an untrusted code from a string or from a file;

- Initiate and interrupt the execution anytime;

- Control the execution of a code against a hangup or too long
  calculation times;

- Perform some heavy calculations in a separate thread
  [[demo](https://asvd.github.io/jailed/demos/circle/)]

- Delegate to a 3rd-party code the precise set of methods to
  harmlessly operate on the part of your application
  [[demo](https://asvd.github.io/jailed/demos/banner/)]

- Safely execute user-submitted code
  [[demo](https://asvd.github.io/jailed/demos/console/)]

- Export the particular set of methods (in both directions) and call
  them from the opposite site, without a need for messaging, thus
  building any custom API and set of permissions.


For instance:


###### application.js

```js
var path = 'http://path.to/the/plugin.js';

// exported methods, will be available to the plugin
var api = {
    alert: alert
};

var plugin = new jailed.Plugin(path, api);
```


###### plugin.js

```js
// runs in a worker, cannot access the main application, with except
// for the explicitly exported alert() method

// exported methods are stored in the application.remote object
application.remote.alert('Hello from the plugin!');
```

Under the hood, the application may only communicate to the plugin
(worker / jailed subprocess) through a messaging mechanism, which is
reused by Jailed to simulate exporting of the particular methods. Each
exported function is duplicated on the opposite site with a special
wrapper method with the same name. After that wrapper is called, the
corresponding message is sent, which leads to the actual function
invocation on the other site. If the executed function then issues a
callback, the responce message will be sent back and handled by the
opposite site, which will in turn execute the actual callback
previously stored upon the initial method call.


### Installation

For the web-browser environment — download the
[distribution](https://github.com/asvd/jailed/releases/download/v0.1.0/jailed-0.1.0.tar.gz)
[14 kb], unpack it and load the `jailed.js` in a preferrable way. That
is an UMD module, so it may simply be loaded as a plain JavaScript
file using the `<script>` tag:

```html
<script src="jailed/jailed.js"></script>
```

For Node.js — install Jailed with npm:

```sh
$ npm install jailed
```

and then in your code:

```js
var jailed = require('jailed');
```

Optionally you may load the script from the
[distribution](https://github.com/asvd/jailed/releases/download/v0.1.0/jailed-0.1.0.tar.gz)
[14 kb]:

```js
var jailed = require('path/to/jailed.js');
```

After the module is loaded, the two plugin constructors are available:
`jailed.Plugin` and `jailed.DynamicPlugin`.



### Usage

The messaging mechanism reused beyond the remote method invocation
introduces some natural limitations to the exported functions and
their usage:

- Arguments may only be either simple objects (which are then
  serialized into a JSON-string and sent within a message), or
  callbacks (which are preserved and replaced with special identifiers
  before sending). Custom object instance may not be used as an
  argument.

- A callback may not be executed several times, it will be removed
  from the callback storage upon the first invocation.

- If several callbacks are provided, only one of them may be called.

- The returned value of an exported function is ignored, result should
  be provided to a callback instead.


A Plugin object may be created either from a string containing a
source code to be executed, or with a path to the script. To load a
plugin source code from a JavaScript file, create the plugin using
`jailed.Plugin` constructor and provide the path:

###### application.js

```js
var path = 'http://path.to/some/plugin.js';

// set of methods to be exported into the plugin
var api = {
    alert: function(text) {
        alert(text);
    }
}

var plugin = new jailed.Plugin(path, api);
```


###### plugin.js

```js
application.remote.alert('hello from the plugin');
```


Creating a plugin from a string with a source code is very similar,
this is performed using `jailed.DynamicPlugin` constructor:


###### application.js

```js
var code = "application.remote.alert('hello from the plugin');";

var api = {
    alert: function(text) {
        alert(text);
    }
}

var plugin = new jailed.DynamicPlugin(code, api);
```

The second argument provided to the plugin constructors is an
interface object with a set of functions to be exported into the
plugin. It is also possible to export functions in the opposite
direction — from a plugin into the main application. It may be useful
if a plugin provides a method to perform a calculation, for
instance. In this case the second argument of a plugin constructor may
be omitted. To export some plugin functions, use
`application.setInterface()` method in the plugin code:


###### application.js

```js
var start = function() {
    plugin.remote.square(2, reportResult);
}

var reportResult = function(result) {
    window.alert("Result is: " + result);
}

var path = "http://path.to/some/plugin.js";
var plugin = new jailed.Plugin(path);
plugin.whenConnected(start);
```

###### plugin.js

```js
// provides a method to square a number

var api = {
    square: function(num, cb) {
        cb(num*num);
    }
}

// exports the api into the application environment
application.setInterface(api);
```


After the plugin is connected, the functions exported by the plugin
code are avaialable at the plugin object `remote` property. To set up
a handler for the connection event, use `whenConnected()` method of a
plugin. It can be used as many times as needed and thus subscribe
several handlers for a single connection event (for convenience, it is
also possible to set a connection handler even after a plugin is
connected — in this case the handler is issued immediately).

To disconnect a plugin from the application site, use the
`disconnect()` method of a plugin. In this case the plugin worker /
subprocess is killed immediately without any chance for its code to
react.

A plugin may disconnect itself by calling the
`application.disconnect()` method.

In addition to `whenConnected()` method, the plugin object also
provides similar `whenFailed()` and `whenDisconnected()` methods:

- `whenFailed()` subscribes a handler function to the connection
  failure event, which happens if there have been some error during
  the plugin initialization, like a network problem or a syntax error
  in the plugin initialization code.

- `whenDisconnected()` subscribes a function to the disconnect event,
  which happens if a plugin was disconnected by calling the
  `disconnect()` method, or a plugin disconnected itself by calling
  `application.disconnect()`, or if a plugin failed to initialize
  (along with failure event). After the event is fired, the plugin is
  not usable anymore.

Just like as for `whenConnected()` method, those two methods may also
be subscribed several times or even after the event was actually
fired.

When the plugin code is executed, the set of functions exported by the
application is already prepared. But if one of those functions is
executed, it will actually be invoked on the application site. If in
this case the code of that function will try to use a function
exported by the plugin, it may not be prepared yet. To solve this, the
`application` object on the plugin's site also provides the similar
`whenConnected()` method which works same as the one of the plugin
object. It allows to initiate the communication only after the
connection is initialized, and the exported set of functions are
avaliable on both sites.


