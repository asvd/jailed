var cb = function(result) {
    application.remote.report(result);
}

application.remote.square(2, cb);