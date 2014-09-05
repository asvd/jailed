
var api = {
    square : function(val, cb) {
        cb(val*val);
    },
    cubeDelayed : function(val, cb) {
        setTimeout(
            function() {
                cb(val*val*val);
            }, 1000
        );
    }
}

application.setInterface(api);