
var step1 = function() {
    var sCb = function() {
        application.remote.report(true, step2);
    }

    var fCb = function() {
        application.remote.report(false, step2);
    }

    application.remote.callMeBack(true, sCb, fCb);
}


var step2 = function() {
    var sCb = function() {
        application.remote.report(false, step3);
    }

    var fCb = function() {
        application.remote.report(true, step3);
    }

    application.remote.callMeBack(false, sCb, fCb);
}


var step3 = function() {
    application.remote.done();
}


application.whenConnected(step1);