var api = {
    squareDelayed : function(val, cb) {
        var cb1 = function() {
             cb(val*val);
         }

        application.remote.wait(cb1);
    }
};

application.setInterface(api);
