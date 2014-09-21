
/**
 * Timeout demo
 * 
 * Performs a heavy calculation within a Plugin, controls the
 * execution time. The Plugin runs in a separate and restricted
 * process which has no access to the external environment, it only
 * provides a method to perform the calculation. If the calculation is
 * not completed within a timeout, the Plugin process is
 * terminated. This approach may be used for the untrusted code which
 * may become too slow or even fall into an infinite loop.
 */

var jailed = require('../../../lib/jailed.js');


// determining the fibonacci number to calculate
var num = 40;
if (process.argv.length < 3 || !+process.argv[2]) {
    console.log(
        'Number was not provided, the default value of '
            + num + ' used instead'
    );

    console.log(
        'Usage: ' +process.argv[0]+ ' ' +process.argv[1]+ ' [number]'
    );

} else {
    num = +process.argv[2]||num;
}


// displays the result
var report = function(result) {
    if (result) {
        console.log('Success! The result is: ' + result);
    } else {
        console.log('The result is unknown :-/');
    }

    plugin.disconnect();
    clearInterval(countdownInterval);
}


// destroys the plugin after several calls
var count = 6;
var countdown = function() {
    if (--count > 0) {
        console.log('Plugin will be destroyed in '+ count +'"');
    } else {
        var msg = 'Plugin has failed to calculate on time ' +
            'and will be destroyed!';
        console.log(msg);
        report(null);
    }
}


// initialize everything
var countdownInterval;

var init = function() {
    console.log('Calculating the fibonacci number for '+num+'...');
    plugin.remote.fib(num, report);
    countdownInterval = setInterval(countdown, 1000);
}

var plugin = new jailed.Plugin(__dirname+'/plugin.js');
plugin.whenConnected(init);

