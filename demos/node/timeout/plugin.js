
var fib = function(num) {
    var result = 0;
    if (num < 2) {
        result = num;
    } else {
        result = fib(num-1) + fib(num-2);
    }

    return result;
}



var api = {
    fib: function(num, cb) {
        cb(fib(num));
    }
};

application.setInterface(api);

