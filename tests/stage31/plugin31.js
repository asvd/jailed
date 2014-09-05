var connected = false;

var tryConnect = function() {
    application.whenConnected(connect);
}

var connect = function() {
    connected = true;
}

var checkConnect = function() {
    application.remote.check(connected, finalize);
}

var finalize = function() {
    application.remote.done();
}

setTimeout(tryConnect, 300);
setTimeout(checkConnect, 600);
