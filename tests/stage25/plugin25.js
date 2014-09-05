
var api = {
    wait: function(cb) {
        setTimeout(cb, 1000);
    }
}

application.setInterface(api);


var step1 = function() {
    var val = 21;
    var cb = function(result) {
        application.remote.check(result == val*val, finalize);
    }
    application.remote.squareDelayed(val, cb);
}

var finalize = function() {
    application.remote.done();
}

application.whenConnected(step1);

