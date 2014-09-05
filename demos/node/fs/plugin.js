
/**
 * A Plugin code, executed within a restricted subprocess and may only
 * perform the methods explicitly exported by the main aplication
 * (available at application.remote)
 */

var timeout = 3;
var timeoutMsec = timeout*1000;
var timeoutMsg = 'in '+timeout+' seconds';
var backup = '';


// functions order nearly corresponds to the execution sequence

var start = function() {
    application.remote.readLog(displayLog, reportNoLog);
}


var reportNoLog = function() {
    application.remote.print(
        'No log file found, '+
        'will create a new one '+timeoutMsg
    );

    setTimeout(createLog, timeoutMsec);
}


var displayLog = function(content) {
    var message =
        '=== Logfile content start: ===\n\n' +
        content +
        '\n=== Logfile content end ===\n';

    application.remote.print(message);
    backup = content;

    application.remote.print(
        'Logfile will be removed '+timeoutMsg
    );

    setTimeout(removeLog, timeoutMsec);
}


var removeLog = function() {
    application.remote.print('Removing logfile...');
    application.remote.deleteLog(reportRemove, createLog);
}


var reportRemove = function() {
    application.remote.print(
        'Logfile removed! Will be recreated '+timeoutMsg
    );

    setTimeout(createLog, timeoutMsec);
}


var createLog = function() {
    application.remote.print('Creating an empty log file');
    application.remote.createLog(reportCreate, finalize);
}


var reportCreate = function() {
    application.remote.print(
        'Empty logfile created, '+
        'will be filled with content '+timeoutMsg
    );

    setTimeout(writeLog, timeoutMsec);
}


var writeLog = function() {
    application.remote.print(
        'Writing the old content into the log file '+
            'along with a new message added'
    );
    var message = 'New message added by the plugin on ' +
        (new Date).toString();
    var text = backup + message + '\n';
    application.remote.updateLog(text, reportWrite, finalize);
}


var reportWrite = function() {
    application.remote.print('Logfile updated');
    finalize();
}


var finalize = function() {
    application.remote.print('Plugin finished');
    application.disconnect();
}


start();

