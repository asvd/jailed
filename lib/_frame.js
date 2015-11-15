
/**
 * Contains the code executed in the sandboxed frame under web-browser
 * 
 * Tries to create a Web-Worker inside the frame and set up the
 * communication between the worker and the parent window. Some
 * browsers restrict creating a worker inside a sandboxed iframe - if
 * this happens, the plugin initialized right inside the frame (in the
 * same thread)
 */


var scripts = document.getElementsByTagName('script');
var thisScript = scripts[scripts.length-1];
var parentNode = thisScript.parentNode;
var __jailed__path__ = thisScript.src
    .split('?')[0]
    .split('/')
    .slice(0, -1)
    .join('/')+'/';


/**
 * Initializes the plugin inside a webworker. May throw an exception
 * in case this was not permitted by the browser.
 */
var initWebworkerPlugin = function() {
    // creating worker as a blob enables import of local files
    var blobCode = [
      ' self.addEventListener("message", function(m){   ',
      '     if (m.data.type == "initImport") {          ',
      '         importScripts(m.data.url);              ',
      '         self.postMessage({                      ',
      '             type : "initialized",               ',
      '             dedicatedThread : true              ',
      '         });                                     ',
      '     }                                           ',
      ' });                                             '
    ].join('\n');

    var blobUrl = window.URL.createObjectURL(
        new Blob([blobCode])
    );

    var worker = new Worker(blobUrl);

    // telling worker to load _pluginWebWorker.js (see blob code above)
    worker.postMessage({
        type: 'initImport',
        url: __jailed__path__ + '_pluginWebWorker.js'
    });


    // mixed content warning in Chrome silently skips worker
    // initialization without exception, handling this with timeout
    var fallbackTimeout = setTimeout(function() {
        worker.terminate();
        initIframePlugin();
    }, 300);

    // forwarding messages between the worker and parent window
    worker.addEventListener('message', function(m) {
        if (m.data.type == 'initialized') {
            clearTimeout(fallbackTimeout);
        }

        parent.postMessage(m.data, '*');
    });

    window.addEventListener('message', function(m) {
        worker.postMessage(m.data);
    });
}


/**
 * Creates plugin right in this iframe
 */
var initIframePlugin = function() {
    // loads additional script into the frame
    window.loadScript = function(path, sCb, fCb) {
        var script = document.createElement('script');
        script.src = path;

        var clear = function() {
            script.onload = null;
            script.onerror = null;
            script.onreadystatechange = null;
            script.parentNode.removeChild(script);
            currentErrorHandler = function(){};
        }

        var success = function() {
            clear();
            sCb();
        }

        var failure = function() {
            clear();
            fCb();
        }

        currentErrorHandler = failure;

        script.onerror = failure;
        script.onload = success;
        script.onreadystatechange = function() {
            var state = script.readyState;
            if (state==='loaded' || state==='complete') {
                success();
            }
        }

        parentNode.appendChild(script);
    }

        
    // handles script loading error
    // (assuming scripts are loaded one by one in the iframe)
    var currentErrorHandler = function(){};
    window.addEventListener('error', function(message) {
        currentErrorHandler();
    });


    window.loadScript(
        __jailed__path__ + '_pluginWebIframe.js',
        function(){}, function(){}
    );
}



try {
    initWebworkerPlugin();
} catch(e) {
    initIframePlugin();
}

