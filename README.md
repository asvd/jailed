Jailed — safe yet flexible sandbox
==================================

Jailed is a small JavaScript library for executing untrusted code as a
*plugin*, a special instance running in a sandboxed environment. The
key feature of Jailed is an opportunity to export a set of methods
into the sandbox — thus defining a precise set of plugin
priviliges. Anything not exported explicitly cannot be accessed: a
plugin runs inside a Web-Worker launched in a sandboxed frame (in case
of web-browser environment), or as a restricted subprocess (in
Node.js).


With Jailed you can:

- Setup a safe environment for executing untrusted code, without a
  need to create a worker / subprocess manually;

- Do that in an isomorphic way: the syntax is same both for Node.js
  and web-browser, the code works unchanged;

- Execute untrusted code from a string or from a file;

- Initiate and interrupt the execution anytime;

- Control the execution against a hangup or too long calculation
  times;

- Perform heavy calculations in a separate thread
  *[Demo](https://asvd.github.io/jailed/demos/web/circle/)*

- Delegate to a 3rd-party code the precise set of methods to
  harmlessly operate on the part of your application
  *[Demo](https://asvd.github.io/jailed/demos/web/banner/)*

- Safely execute user-submitted code
  *[Demo](https://asvd.github.io/jailed/demos/web/console/)*

- Export the particular set of functions (in both directions) and call
  them from the opposite site (without a need for manual messaging)
  thus building any custom API and set of permissions.


For instance:


```js
var path = 'http://path.to/the/plugin.js';

// exported methods, will be available to the plugin
var api = {
    alert: alert
};

var plugin = new jailed.Plugin(path, api);
```


*plugin.js:*

```js
// runs in a worker, cannot access the main application, with except
// for the explicitly exported alert() method

// exported methods are stored in the application.remote object
application.remote.alert('Hello from the plugin!');
```

*(exporting the `alert()` method is not that good idea actually)*

Under the hood, an application may only communicate to a plugin
(sandboxed worker / jailed subprocess) through a messaging mechanism,
which is reused by Jailed in order to simulate the exporting of
particular functions. Each exported function is duplicated on the
opposite site with a special wrapper method with the same name. Upon
the wrapper method is called, arguments are serialized, and the
corresponding message is sent, which leads to the actual function
invocation on the other site. If the executed function then issues a
callback, the responce message will be sent back and handled by the
opposite site, which will in turn execute the actual callback
previously stored upon the initial wrapper method invocation. A
callback is in fact a short-term exported function and behaves in the
same way, particularly it may invoke a newer callback in reply.


### Security

##### For Node.js the Jailed library does the following:

- creates a subprocess (launches the
[_pluginNode.js](https://github.com/asvd/jailed/blob/master/lib/_pluginNode.js)
script in that process);

- (down)loads the file containing an untrusted code as a string (or
  simply takes the string containing the code, in case of
  `DynamicPlugin`);

- appends `"use strict";` at the head of that code (in order to
  prevent breaking the sandbox using `arguments.callee.caller`);

- finally executes the code using `vm.runInNewContext()` method, where
  the provided sandbox only exposes some basic methods like
  `setTimeout()`, and the `application` object for messaging with the
  application site.


##### Under web-browser, the plugin is launched in the following way:

- creates a [sandboxed
iframe](http://www.html5rocks.com/en/tutorials/security/sandboxed-iframes/),
where the sandbox attribute is only set to `"allow-scripts"` which
prevents the framed content from accessing anything of the main
application origin;

- then a Web-Worker is created inside that farme;

- finally the code string / script filename is transfered as a message
  into the worker in order to execute the code inside it

*Note: when loading the Jailed library from the local file in a
 web-browser (so that its path starts with `file://`), the
 `"allow-same-origin"` permission is added for the iframe sandbox
 attribute. Local installations are mostly used for testing, and
 without that permission it would not be possible to load the plugin
 code from a local file. On the other hand that means that the code
 jailed in a plugin has an access to the local filesystem, and to some
 origin-shared things, like IndexedDB (though it is still jailed
 within a Worker and cannot access the main application page).*



### Installation

For the web-browser environment — download the
[distribution](https://github.com/asvd/jailed/releases/download/v0.1.1/jailed-0.1.1.tar.gz)
*8 kb*, unpack it and load the `jailed.js` in a preferrable way. That
is an UMD module, thus for instance it may simply be loaded as a plain
JavaScript file using the `<script>` tag:

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
[distribution](https://github.com/asvd/jailed/releases/download/v0.1.1/jailed-0.1.1.tar.gz)
*8 kb*:

```js
var jailed = require('path/to/jailed.js');
```

After the module is loaded, the two plugin constructors are available:
`jailed.Plugin` and `jailed.DynamicPlugin`.



### Usage

The messaging mechanism reused beyond the remote method invocation
introduces some natural limitations for the exported functions and
their usage (nevertheless the most common use-cases are still
straightforward):

- Exported function arguments may only be either simple objects (which
  are then serialized and sent within a message), or callbacks (which
  are preserved and replaced with special identifiers before
  sending). Custom object instance may not be used as an argument.

- A callback can not be executed several times, it will be destroyed
  upon the first invocation.

- If several callbacks are provided, only one of them may be called.

- Returned value of an exported function is ignored, result should be
  provided to a callback instead.


A plugin object may be created either from a string containing a
source code to be executed, or with a path to the script. To load a
plugin code from a file, create the plugin using `jailed.Plugin`
constructor and provide the path:

```js
var path = 'http://path.to/some/plugin.js';

// set of methods to be exported into the plugin
var api = {
    alert: alert
}

var plugin = new jailed.Plugin(path, api);
```


*plugin.js:*

```js
application.remote.alert('Hello from the plugin!');
```


Creating a plugin from a string containing a code is very similar,
this is performed using `jailed.DynamicPlugin` constructor:


```js
var code = "application.remote.alert('Hello from the plugin!');";

var api = {
    alert: alert
}

var plugin = new jailed.DynamicPlugin(code, api);
```


The second `api` argument provided to the `jailed.Plugin` and
`jailed.DynamicPlugin` constructors is an interface object with a set
of functions to be exported into the plugin. It is also possible to
export functions in the opposite direction — from a plugin to the main
application. It may be used for instance if a plugin provides a method
to perform a calculation. In this case the second argument of a plugin
constructor may be omitted. To export some plugin functions, use
`application.setInterface()` method in the plugin code:


```js
// create a plugin
var path = "http://path.to/some/plugin.js";
var plugin = new jailed.Plugin(path);

// called after the plugin is loaded
var start = function() {
    // exported method is available at this point
    plugin.remote.square(2, reportResult);
}

var reportResult = function(result) {
    window.alert("Result is: " + result);
}

// execute start() upon the plugin is loaded
plugin.whenConnected(start);
```

*plugin.js:*

```js
// provides the method to square a number
var api = {
    square: function(num, cb) {
        // result reported to the callback
        cb(num*num);
    }
}

// exports the api to the application environment
application.setInterface(api);
```

In this example the `whenConnected()` plugin method is used at the
application site: that method subscribes the given function to the
plugin connection event, after which the functions exported by the
plugin become accessible at the `remote` property of a plugin.

The `whenConnected()` method may be used as many times as needed and
thus subscribe several handlers for a single connection event. For
additional convenience, it is also possible to set a connection
handler even after the plugin has already been connected — in this
case the handler is issued immediately (yet asynchronously).

When a plugin code is executed, a set of functions exported by the
application is already prepared. But if one of those functions is
invoked, it will actually be called on the application site. If in
this case the code of that function will try to use a function
exported by the plugin, it may not be prepared yet. To solve this, the
similar `application.whenConnected()` method is available on the
plugin site. The method works same as the one of the plugin object:
the subscribed handler function will be executed after the connection
is initialized, and a set of functions exported by each site is
available on the opposite site.


Therefore:

- If you need to load a plugin and supply it with a set of exported
  functions, simply provide those functions into the plugin
  constructor, and then access those at `applictaion.remote` property
  on the plugin site — the exported functions are already prepared
  when the plugin code is exectued.

- If you need to load a plugin and use the functions it provides
  through exporting, set up a handler using `plugin.whenConnected()`
  method on the application site. After the event is fired, the
  functions exported by the plugin are available at its `remote`
  property of the plugin object;.

- If both application and a plugin use the exported functions of each
  other, *and* the communication is initiated by the plugin, you will
  most likely need to use the `application.whenConnected()` method on
  the plugin site before initiating the communication, in order to
  make sure that the functions exported by the plugin are already
  available to the application.


To disconnect a plugin, use the `disconnect()` method: it kills a
worker / subprocess immediately without any chance for its code to
react.

A plugin may also disconnect itself by calling the
`application.disconnect()` method.

In addition to `whenConnected()` method, the plugin object also
provides similar `whenFailed()` and `whenDisconnected()` methods:

- `whenFailed()` subscribes a handler function to the connection
  failure event, which happens if there have been some error during
  the plugin initialization, like a network problem or a syntax error
  in the plugin initialization code.

- `whenDisconnected()` subscribes a function to the disconnect event,
  which happens if a plugin was disconnected by calling the
  `disconnect()` method, or a plugin has disconnected itself by
  calling `application.disconnect()`, or if a plugin failed to
  initialize (along with the failure event mentioned above). After the
  event is fired, the plugin is not usable anymore.

Just like as for `whenConnected()` method, those two methods may also
be used several times or even after the event has actually been fired.


