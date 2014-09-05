
var api = {
    square : function(val, cb) {
        cb(val*val);
    },
    broken : function(cb) {
        somethingWrong();
        cb();
    },
    brokenDelayed : function(cb) {
        setTimeout(cb, 500);
        somethingWrong();
    }
}

application.setInterface(api);
