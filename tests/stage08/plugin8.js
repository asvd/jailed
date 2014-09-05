
var val1 = 2;

var cb1 = function(result) {
    application.remote.check(result == val1*val1);

    setTimeout(step2, 1000);
}

var step2 = function() {
    var val2 = 5;
    
    var cb2 = function(result) {
        application.remote.check(result == val2*val2);

        setTimeout(function() { application.remote.done(); }, 1000);
    }

    application.remote.square(val2, cb2);
}

application.remote.square(val1, cb1);