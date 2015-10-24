
/**
 * Contains the routines loaded by the plugin iframe under web-browser
 * in case when worker failed to initialize
 * 
 * Initializes the web environment version of the platform-dependent
 * connection object for the plugin site
 */


window.application = {};
window.connection = {};


// event listener for the plugin message
window.addEventListener('message', function(e) {
    var m = e.data.data;
    switch (m.type) {
    case 'import':
    case 'importJailed':  // already jailed in the iframe
        importScript(m.url);
        break;
    case 'execute':
        execute(m.code);
        break;
    case 'message':
        conn._messageHandler(m.data);
        break;
    }
});


// loads and executes the javascript file with the given url
var importScript = function(url) {
    var success = function() {
        parent.postMessage({
            type : 'importSuccess',
            url  : url
        }, '*');
    }

    var failure = function() {
       parent.postMessage({
           type : 'importFailure',
           url  : url
       }, '*');
    }

    var error = null;
    try {
        window.loadScript(url, success, failure);
    } catch (e) {
        error = e;
    }

    if (error) {
        throw error;
        failure();
    }
}


// evaluates the provided string
var execute = function(code) {
    try {
        eval(code);
    } catch (e) {
        parent.postMessage({type : 'executeFailure'}, '*');
        throw e;
    }

    parent.postMessage({type : 'executeSuccess'}, '*');
}


// connection object for the JailedSite constructor
var conn = {
    disconnect : function() {},
    send: function(data) {
        parent.postMessage({type: 'message', data: data}, '*');
    },
    onMessage: function(h){ conn._messageHandler = h },
    _messageHandler: function(){},
    onDisconnect: function(){}
};

window.connection = conn;

parent.postMessage({
    type : 'initialized',
    dedicatedThread : false
}, '*');

