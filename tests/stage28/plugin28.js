var api = {
    callme : function(cb0, cb1) {
        var finalize = function() {
            application.remote.done();
        }

        setTimeout(finalize, 1000);

        cb0();

        try {
            cb1();
            application.remote.check(false);
        } catch(e) {
            application.remote.check(true);
            throw e;
        }
    }
};

application.setInterface(api);