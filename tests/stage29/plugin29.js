
var api = {
    brokenDelayed : function(cb) {
        setTimeout(
            function() {
                somethingWrong();
            }, 1000
        );

        setTimeout(
            function() {
                cb();
            }, 2000
        );

        
    }
};

application.setInterface(api);


/*

setTimeout(
    function() {
        somethingWrongHere();
    },
    1000
);

*/

