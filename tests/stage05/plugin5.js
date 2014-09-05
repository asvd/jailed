var waitCalled = false;

var api = {
    wait : function(cb) {
        waitCalled = true;
        setTimeout(cb,1000);
    }
};


application.setInterface(api);

var init = function() {
    var val = 2;
    var cb = function(result) {
        application.remote.report(result, waitCalled);
    }

    application.remote.squareDelayed(val, cb)
}

application.whenConnected(init);