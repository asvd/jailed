
var api = {
    square : function(val, cb) {
        cb(val*val);
    }
}

application.setInterface(api);