/**
 * This is a set of Helios Kernel modules merged with helios-merge
 *
 * http://asvd.github.io/helios-kernel
 * http://github.com/asvd/helios-merge
 *
 * The comment related to this code normally preceeds the main module
 * (following the last here, according to the dependency order)
 */


// base.js

/**
 * @fileoverview Lighttest library base object definition
 */
(function(){
    lighttest = {};
})();



// platform.js

/**
 * @fileoverview Platform-dependent routines for the Lighttest library
 */
(function(){
    lighttest._platform = {};
    lighttest._platform._initialized = false;
    /**
     * Initializes Lighttest upon the first launch of the tests
     */
    lighttest._platform.init = function () {
        if (!lighttest._platform._initialized) {
            if (typeof window != 'undefined') {
                lighttest._platform._initWeb();
            } else {
                lighttest._platform._initNode();
            }
            lighttest._platform._initialized = true;
        }
    };
    /**
     * Initializes Lighttest for the web-based environment
     */
    lighttest._platform._initWeb = function () {
        var target = document.getElementById('lighttest') || document.getElementsByTagName('body').item(0);
        target.style.margin = 0;
        var style1 = {
                backgroundColor: 'rgb(2,14,15)',
                width: '100%',
                height: '100%',
                overflow: 'auto',
                position: 'absolute'
            };
        var div1 = document.createElement('div');
        for (var i in style1) {
            div1.style[i] = style1[i];
        }
        target.appendChild(div1);
        var style2 = {
                color: 'rgb(173,196,190)',
                paddingBottom: '5px',
                paddingLeft: '5px',
                fontFamily: 'monospace',
                fontSize: '8pt',
                position: 'absolute'
            };
        var div2 = document.createElement('div');
        for (i in style2) {
            div2.style[i] = style2[i];
        }
        div1.appendChild(div2);
        lighttest._platform.print = function (text) {
            div2.innerHTML += text.replace(/\ /g, '&nbsp;');
        };
        lighttest._platform._printPlain = function (text) {
            div2.innerHTML += text;
        };
        var styleRed = 'text-shadow : 0px 0px 6px #FD4E7F; color: #F13D35;';
        lighttest._platform.printRed = function (text) {
            lighttest._platform._printPlain('<span style="' + styleRed + '">' + text + '</span>');
        };
        var styleGreen = 'text-shadow : 0px 0px 8px #50A39C; color: #56D670;';
        lighttest._platform.printGreen = function (text) {
            lighttest._platform._printPlain('<span style="' + styleGreen + '">' + text + '</span>');
        };
        var styleBlue = 'text-shadow: 0px 0px 8px #507EA3; color: #58AEC9;';
        lighttest._platform.printBlue = function (text) {
            lighttest._platform._printPlain('<span style="' + styleBlue + '">' + text + '</span>');
        };
        lighttest._platform.printWhite = function (text) {
            lighttest._platform._printPlain(text);
        };
        lighttest._platform.printLine = function () {
            div2.innerHTML += '<br/>';
            console.groupEnd();
            setTimeout(function () {
                div1.scrollTop = div1.scrollHeight;
            }, 1);
        };
        lighttest._platform.printTestLabel = function(text) {
            lighttest._platform.printWhite(text + '  ');
            console.group(text);
//            console.group("%c" + '' + text, "font-weight:bold;");
        }
        lighttest._platform.printPass = function() {
            lighttest._platform.printGreen('PASS ');
            console.log('%c' + 'PASS', 'color: #36B650;font-weight:bold');
        }
        lighttest._platform.printFail = function() {
            lighttest._platform.printRed('FAIL ');
            console.error('%c' + 'FAIL', 'color: #F13D35;font-weight:bold');
        }
        lighttest._platform.reset = function () {
            div2.innerHTML = '';
        };
        lighttest._platform.exit = function (code) {
        };
    };
    /**
     * Initializes Lighttest for the Node.js-based environment
     */
    lighttest._platform._initNode = function () {
        var red = '\x1B[31m';
        var green = '\x1B[32m';
        var bold = '\x1b[1m';
        var blue = '\x1B[36m';
        var reset = '\x1B[0m';
        lighttest._platform.print = function (val) {
            process.stdout.write(val);
        };
        lighttest._platform.printRed = function (text) {
            lighttest._platform.print(red + bold + text + reset);
        };
        lighttest._platform.printGreen = function (text) {
            lighttest._platform.print(green + bold + text + reset);
        };
        lighttest._platform.printBlue = function (text) {
            lighttest._platform.print(blue + text + reset);
        };
        lighttest._platform.printWhite = function (text) {
            lighttest._platform.print(bold + text + reset);
        };
        lighttest._platform.printLine = function () {
            console.log();
        };
        lighttest._platform.printTestLabel = function(text) {
            lighttest._platform.printWhite(text + '  ');
        }
        lighttest._platform.printPass = function() {
            lighttest._platform.printGreen('PASS ');
        }
        lighttest._platform.printFail = function() {
            lighttest._platform.printRed('FAIL ');
            console.log('');
        }
        lighttest._platform.reset = function (code) {
        };
        lighttest._platform.exit = function (code) {
            process.exit(code);
        };
        // prevents from crashing on exceptions
        process.on('uncaughtException', function (err) {
            console.log();
            console.error(err);
        });
    };
})();



// lighttest.js

/**
 * @fileoverview Lighttest - a clear testing environment
 * 
 * @version 0.1.3
 * 
 * Copyright (c) 2014 asvd <heliosframework@gmail.com> 
 * 
 * Lighttest library is licensed under the MIT license,
 * see http://github.com/asvd/lighttest
 */
(function(){
    lighttest._state = 'nothing';
    lighttest._pendingTests = null;
    lighttest._pendingCallback = null;
    /**
     * Wraps the given code so that in case of exception it will fail
     * the test (instead of breaking the stack)
     * 
     * @param {Function} method to wrap
     * 
     * @returns {Function} wrapped method
     */
    lighttest.protect = function (method) {
        return function () {
            try {
                method.apply(this, arguments);
            } catch (e) {
                lighttest.check(false);
                lighttest.done();
                throw e;
            }
        };
    };
    /**
     * Runs the given set of tests
     * 
     * @param {Array} tests list of tests to execute
     * @param {Function} callback to run after the tests
     */
    lighttest.start = function (tests, callback) {
        switch (lighttest._state) {
        case 'nothing':
        case 'paused':
            // (re)start
            lighttest._platform.init();
            lighttest._platform.reset();
            lighttest._testsFailed = 0;
            lighttest._currentTestIdx = 0;
            lighttest._state = 'running';
            lighttest._callback = callback || null;
            lighttest._tests = [];
            for (var label in tests) {
                if (tests.hasOwnProperty(label)) {
                    lighttest._tests.push({
                        label: label,
                        method: lighttest.protect(tests[label])
                    });
                }
            }
            lighttest._next();
            break;
        case 'running':
        case 'interrupting':
            // switching to restart even in case of requested pause
            // (restart is stronger)
            lighttest._state = 'interrupting';
            lighttest._pendingTests = tests;
            lighttest._pendingCallback = callback;
            break;
        }
    };
    /**
     * (Un)pauses the tests execution (waiting until the currently
     * running test is completed)
     */
    lighttest.pause = function () {
        switch (lighttest._state) {
        case 'nothing':
        case 'interrupting':
            break;
        case 'running':
            // pausing
            lighttest._state = 'interrupting';
            lighttest._pendingTests = null;
            lighttest._pendingCallback = null;
            break;
        case 'paused':
            // unpausing
            lighttest._state = 'running';
            lighttest._next();
            break;
        }
    };
    /**
     * Checks the given value against being true, logs the result for
     * the currently running test
     * 
     * @param {Boolean} value to check
     */
    lighttest.check = function (value) {
        if (value) {
            lighttest._platform.printPass();
        } else {
            lighttest._platform.printFail();
            lighttest._currentFailed = true;
        }
    };
    /**
     * Called by the test body when finished, launches the next test
     */
    lighttest.done = function () {
        // let pause() called after done() time to perform
        setTimeout(lighttest._done, 10);
    };
    /**
     * Launches the next test
     */
    lighttest._done = function () {
        if (lighttest._currentFailed) {
            lighttest._testsFailed++;
        }
        lighttest._currentTestIdx++;
        switch (lighttest._state) {
        case 'paused':
        case 'nothing':
            // tests not running
            break;
        case 'running':
            // normal case, prevent stack growth
            setTimeout(lighttest._next, 0);
            break;
        case 'interrupting':
            if (lighttest._pendingTests) {
                // restart requested
                lighttest._state = 'nothing';
                var tests = lighttest._pendingTests;
                var callback = lighttest._pendingCallback;
                lighttest._pendingTests = null;
                lighttest._pendingCallback = null;
                lighttest.start(tests, callback);
            } else {
                // pause requested
                lighttest._state = 'paused';
                lighttest._platform.printLine();
                lighttest._platform.printLine();
                lighttest._platform.printBlue('// paused');
                lighttest._platform.printLine();
            }
            break;
        }
    };
     lighttest._genPfx = function(num) {
         var testsnum = lighttest._tests.length;
         var len = (''+testsnum).length;
         var result  = ('00000000'+(num+1)).substr(-len);
         result = ''+result + ' ';
         return result;
     }
    /**
     * Proceeds to the next test
     */
    lighttest._next = function () {
        var idx = lighttest._currentTestIdx;
        if (idx == lighttest._tests.length) {
            lighttest._finalize();
        } else {
            lighttest._platform.printLine();
            lighttest._currentFailed = false;
            var test = lighttest._tests[idx];
            lighttest._platform.printTestLabel(lighttest._genPfx(idx) + test.label);
            setTimeout(test.method, 0);
        }
    };
    /**
     * Finalizes testing after all tests completed
     */
    lighttest._finalize = function () {
        var failed = lighttest._testsFailed;
        var total = lighttest._tests.length;
        lighttest._platform.printLine();
        lighttest._platform.printLine();
        if (failed) {
            lighttest._platform.print(failed + ' of ' + total + ' tests ');
            lighttest._platform.printRed('FAILED');
        } else {
            lighttest._platform.print(total + ' tests ');
            lighttest._platform.printGreen('PASSED');
        }
        lighttest._platform.printLine();
        lighttest._platform.printLine();
        lighttest._state = 'nothing';
        if (lighttest._callback) {
            lighttest._callback(failed);
        }
        lighttest._platform.exit(failed);
    };
})();


