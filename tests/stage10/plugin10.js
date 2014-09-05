
var cb1 = function(result) {
    var cb2 = function() {
        application.remote.done();
    }

    application.remote.report(result, cb2);
}


application.remote.getNum(cb1);