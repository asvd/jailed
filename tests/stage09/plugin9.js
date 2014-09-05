var finalize = function() {
    application.remote.done();
}

application.remote.checkAttempt(finalize);