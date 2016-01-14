application.setInterface({
    process : function(input, code, cb) {
        eval('method = '+code);
        eval('data = '+ input);
        cb(method(data));
    }
});
