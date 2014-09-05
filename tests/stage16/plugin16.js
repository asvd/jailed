
var step1 =  function() {
    var _doc = (typeof document != 'undefined' &&
                document &&
                typeof document.getElementsByTagName != 'undefined');

    var _proc = (typeof process != 'undefined' &&
                 process &&
                 typeof process.version != 'undefined');

    var _require = (typeof require != 'undefined' && !!require);

    application.remote.check(!_doc && !_proc && !_require, step2);
}

var step2 = function() {
    application.remote.done();
}



application.whenConnected(step1);
