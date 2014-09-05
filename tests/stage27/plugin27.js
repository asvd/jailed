

var init = function() {
    var notYetCalled = true;
    var cb = function() {
        application.remote.check(notYetCalled);
        notYetCalled = false;
    }

    application.remote.callme(cb, cb);
}

application.whenConnected(init);
