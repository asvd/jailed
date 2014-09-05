
// animates the circle
var circle = document.getElementById('circle');
var X = 0;  // animation parameters
var Y = 0;

setInterval(
    function() {
        X += .04;
        Y += .05;
        circle.style.marginLeft = Math.sin(Math.sin(X)*4)*13;
        circle.style.marginTop  = Math.sin(Math.sin(Y)*4)*5;
    }, 20
);


// (de)activates the circle highlight during the calculations
var highlight = function(activate) {
    if (activate) {
        circle.style.backgroundColor = '#223344';
        circle.style.border = '1px solid #99AABB';
        circle.style.boxShadow =
            '0px 0px 5px 0px rgba(100, 120, 140, .5)';
    } else {
        circle.style.backgroundColor = '#112233';
        circle.style.border = '1px solid #556677';
        circle.style.boxShadow = 'none';
    }
}


// slowly calculates the fibonacci number
var fib = function(num) {
    var result = 0;
    if (num < 2) {
        result = num;
    } else {
        result = fib(num-1) + fib(num-2);
    }

    return result;
}


var arg = 40;  // fibonacci number argument

// starts local calculation
var calculateLocal = function() {
    var output = document.getElementById('outputLocal');

    output.innerHTML = '';
    highlight(true);

    setTimeout(
        function() {
            var result = fib(arg);
            output.innerHTML = result;
            highlight(false);
        }, 100
    );
}

// starts calculation in the plugin
var calculatePlugin = function() {
    var output = document.getElementById('outputPlugin');

    output.innerHTML = '';
    highlight(true);

    var cb = function(result) {
        output.innerHTML = result;
        highlight(false);
    }

    plugin.remote.fib(arg, cb);
}


// initialize everything
var start = function() {
    document.getElementById('btnLocal').onclick = calculateLocal;
    document.getElementById('btnPlugin').onclick = calculatePlugin;
}

var scripts = document.getElementsByTagName('script');
var path = scripts[scripts.length-1].src
    .split('/')
    .slice(0, -1)
    .join('/')+'/';

var plugin = new jailed.Plugin(path+'plugin.js');
plugin.whenConnected(start);

