var api = {
    squareDelayed: function(val, cb) {
        application.remote.wait(
            function() {
                cb(val*val);
            }
        );
    }
};

application.setInterface(api);