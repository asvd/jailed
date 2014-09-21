
/**
 * Filesystem demo
 * 
 * A code loaded as a Plugin is provided with a restricted access to
 * the filesystem: it can only create, read, update and delete the
 * particular file (log.txt). A method for printing a message is
 * additionally exported for the demonstration purposes.
 */

var jailed = require('../../../lib/jailed.js');
var fs = require('fs');


// building plugin interface
var log = __dirname + '/log.txt';

// creates the empty log file
var createLog = function(sCb, fCb) {
    var cb = function(err) {
        if (err) {
            fCb();
        } else {
            sCb();
        }
    }

    fs.writeFile(log, '', cb);
}


// reads the log file
var readLog = function(sCb, fCb) {
    var cb = function(err, data) {
        if (err) {
            fCb();
        } else {
            sCb(data.toString());
        }
    }

    fs.readFile(log, cb);
}


// puts the given content into the log file
var updateLog = function(data, sCb, fCb) {
    var cb = function(err) {
        if (err) {
            fCb();
        } else {
            sCb();
        }
    }

    fs.writeFile(log, data, cb);
}


// removes the log file
var deleteLog = function(sCb, fCb) {
    var cb = function(err) {
        if (err) {
            fCb();
        } else {
            sCb();
        }
    }

    fs.unlink(log, cb);
}


// prints the given message on the console
var print = function(msg) {
    console.log(msg);
}


var api = {
    print: print,
    createLog: createLog,
    readLog: readLog,
    updateLog: updateLog,
    deleteLog: deleteLog
};


var plugin = new jailed.Plugin(__dirname + '/plugin.js', api);

// all other work is performed by the plugin
