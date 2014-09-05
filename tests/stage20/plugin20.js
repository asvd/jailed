
var step1 = function() {
    application.remote.check(true, step1_1);
}

var step1_1 = function() {
    var val = 6;
    var cb = function(result) {
        application.remote.check(result == val*val, step2);
    }

    application.remote.square(val, cb);
}


var step2 = function() {
    var cb = function() {
        clearTimeout(timeout);
        application.remote.check(true, step3);
    }

    var fCb = function() {
        var finalize = function() {
            application.remote.done();
        }

        application.remote.check(false, finalize);
    }


    application.remote.brokenDelayed(cb);

    timeout = setTimeout(fCb, 1000);
}


var step3 = function() {
    var finalize = function() {
        application.remote.done();
    }

    application.remote.check(true, finalize);
}


var fail = function() {
    clearTimeout(timeout);
    var finalize = function() {
        application.remote.done();
    }

    application.remote.check(false, finalize);
}

application.remote.broken(fail);

var timeout = setTimeout(step1, 1000);

