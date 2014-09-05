var squareFinished = false;
var cubeFinished = false;


var valCube = 6;


var cbCube = function(result) {
    cubeFinished = true;
    application.remote.check(result == valCube*valCube*valCube, finalize);
}

application.remote.cubeDelayed(valCube, cbCube);

var valSquare = 8;
var cbSquare = function(result) {
    squareFinished = true;
    application.remote.check(result == valSquare*valSquare, finalize);
}

application.remote.square(valSquare, cbSquare);


var finalize = function() {
    if (squareFinished && cubeFinished) {
        application.remote.check(
            true,
            function() {
                application.remote.done();
            }
        );
    }
}

