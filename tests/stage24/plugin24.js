
var step1 = function() {
    var cb0 = function() {
        application.remote.check(false, step2);
    }

    var cb1 = function() {
        application.remote.check(true, step2);
    }

    application.remote.callback(1, cb0, cb1);
}

var step2 = function() {
    var cb0 = function() {
        application.remote.check(true, finalize);
    }


    var cb1 = function() {
        application.remote.check(false, finalize);
    }

    application.remote.callback(0, cb0, cb1);
}

var finalize = function() {
    application.remote.done();
}


application.whenConnected(step1);

