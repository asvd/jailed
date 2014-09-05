var api = {
    square : function(val, cb) { cb(val*val); },
    killYourself : function() { application.disconnect(); }
}

application.setInterface(api);

