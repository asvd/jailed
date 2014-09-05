
var api = {
    infinite: function(cb) {
        while (true) {};
        cb();
    }
}

application.setInterface(api);
