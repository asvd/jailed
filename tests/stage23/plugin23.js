
var api = {
    callback: function(num, cb0, cb1) {
        if (num == 0) {
            cb0();
        } else {
            cb1();
        }
    }
}

application.setInterface(api);