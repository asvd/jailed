application.setInterface({
    process : function(input, code, cb) {
        var result = {
            output: null,
            error: null
        };

        try {
            eval('method = '+code);
            eval('data = '+ input);
            result.output = method(data);
        } catch(e) {
            result.error = e.message;
        }

        cb(result);
    }
});
