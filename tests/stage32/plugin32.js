var beforeConnect1Finished = 0;
var beforeConnect1 = function() {
    beforeConnect1Finished++;
    finalize();
}

var beforeConnect2Finished = 0;
var beforeConnect2 = function() {
    beforeConnect2Finished++;
    finalize();
}


var afterConnect1Finished = 0;
var afterConnect1 = function() {
    afterConnect1Finished++;
    finalize();
}

var afterConnect2Finished = 0;
var afterConnect2 = function() {
    afterConnect2Finished++;
    finalize();
}


var finalize = function() {
    /*
    console.log('HAAA');
                    console.log(beforeConnect1Finished );
                    console.log(beforeConnect2Finished );
                    console.log(afterConnect1Finished );
                    console.log(afterConnect2Finished );
     */
    if (
        beforeConnect1Finished == 1 &&
        beforeConnect2Finished == 1 &&
        afterConnect1Finished == 1 &&
        afterConnect2Finished == 1
    ) {
        application.remote.check(
            beforeConnect1Finished == 1 &&
                beforeConnect2Finished == 1 &&
                afterConnect1Finished == 1 &&
                afterConnect2Finished == 1,
            function() {
                application.remote.finished();
            }
        );
    }
}

var connect = function() {
    setTimeout(afterConnect, 300);
}

var afterConnect = function() {
    application.whenConnected(afterConnect1);
    application.whenConnected(afterConnect2);
}

application.whenConnected(beforeConnect1);
application.whenConnected(beforeConnect2);
application.whenConnected(connect);
