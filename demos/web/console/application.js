
// component shortcuts
var el = {};
var list = [
    'terminalWrap', 'command', 'line', 'terminal', 'indicator'
];

for (var i = 0; i < list.length; i++){
    el[list[i]] = document.getElementById(list[i]);
}


// newer elements template
var sample = document.createElement('div');


// command history
var hist = {
    _list: [''],
    _pos: 0,

    push: function(val) {
        var last = this._list.length-1;

        // prevent duplicates
        if (this._list[last-1] !== val) {
            this._list[last] = val;
            this._list.push('');
        }

        this._pos = this._list.length-1;
    },
    
    set: function(val) {
        if (this._pos >= this._list.length-1) {
            this._list[this._pos] = val;
        }
    },

    next: function() {
        if (typeof this._list[this._pos+1] != 'undefined') {
            this._pos++;
        }

        return this._list[this._pos];
    },

    prev: function() {
        if (typeof this._list[this._pos-1] != 'undefined') {
            this._pos--;
        }

        return this._list[this._pos];
    }
};


// command line keypress handlers
el.line.onkeydown = function(e) {
    switch (e.keyCode) {
    case 38: // up arrow
        var val = hist.prev();
        el.line.value = val;
        el.line.setSelectionRange(val.length, val.length);
        e.preventDefault();
        break;

    case 40: // down arrow
        var val = hist.next();
        el.line.value = val;
        el.line.setSelectionRange(val.length, val.length);
        e.preventDefault();
        break;

    case 13: // enter
        var val = el.line.value;
        if (val) {
            hist.push(val);
            el.line.value = '';
            submit(val);
        }
        break;
    }
}


el.line.onkeyup = function(e) {
    switch (e.keyCode) {
    case 38: // up arrow
    case 40: // down arrow
    case 13: // enter
        break;

    default:
        // update current history entry
        hist.set(el.line.value);
        break;
    }
}


// sends the input to the plugin for evaluation
var submit = function(code) {
    animateSubmit(code);

    // postpone the evaluation until the plugin is initialized
    plugin.whenConnected(
        function() {
            if (requests == 0) {
                startLoading();
            }

            requests++;
            plugin.remote.run(code);
        }
    );
}


// animates input submission
var animateSubmit = function(code) {
    var anim = sample.cloneNode(false);
    anim.setAttribute('class', 'commandTextAnimated');
    anim.innerHTML = escape(code);

    el.command.appendChild(anim);

    anim.offsetHeight;
    anim.style.top = -20;
    anim.style.opacity = .6;

    setTimeout(
        function() {
            el.command.removeChild(anim);
        }, 500
    );

}


// prepares the string to be printed on the terminal
var escape = function(msg) {
    return msg.
        replace(/&/g,'&amp;').
        replace(/</g,'&lt;').
        replace(/>/g,'&gt;').
        replace(/\n/g, '<br/>').
        replace(/ /g, '&nbsp;');
}


// puts the message on the terminal
var print = function(cls, msg) {
    var cmp = sample.cloneNode(false);
    cmp.setAttribute('class', cls);

    if (msg) {
        cmp.innerHTML = escape(msg);
    }

    el.terminal.appendChild(cmp);
    scroll();
}


// slides the terminal content to display the newly added message
var scroll = function() {
    el.terminal.offsetHeight;  // redraw
    el.terminal.style.transition = 'top .15s';
    el.terminal.style.top =
        el.terminalWrap.offsetHeight - el.terminal.scrollHeight;
}


// will restart the plugin if it does not respond
var disconnectTimeout = null;
var startLoading = function() {
    disconnectTimeout = setTimeout(disconnect, 3000);
    el.indicator.offsetHeight;
    el.indicator.style.transition = 'background-color 4s';
    el.indicator.style.backgroundColor = '#839AC2';
}

var endLoading = function() {
    clearTimeout(disconnectTimeout);
    el.indicator.offsetHeight;
    el.indicator.style.transition = 'background-color .3s';
    el.indicator.style.backgroundColor = '#152637';
}

var disconnect = function() {
    plugin.disconnect();
}


// interface provided to the plugin
var api = {
    output: function(data) {
        if (!--requests) {
            endLoading();
        }

        print('separator');
        print('input', data.input);
        if (data.error) {
            print('message', data.error);
        } else {
            print('output', data.output);
        }
    }
};


// obtaining absolute path of this script
var scripts = document.getElementsByTagName('script');
var path = scripts[scripts.length-1].src
    .split('?')[0]
    .split('/')
    .slice(0, -1)
    .join('/')+'/';



var requests;

// (re)initializes the plugin
var reset = function() {
    requests = 0;
    plugin = new jailed.Plugin(path+'plugin.js', api);
    plugin.whenDisconnected( function() {
        // give some time to handle the last responce
        setTimeout( function() {
            endLoading();

            while (el.terminal.hasChildNodes()) {
                el.terminal.removeChild(el.terminal.childNodes[0]);
            }

            el.terminal.style.transition = 'top 0s';
            el.terminal.style.top = el.terminalWrap.offsetHeight;

            print('message', 'Well done, you have just ruined everything :-/');
            print('message', 'The console was restarted');

            reset();
        }, 10);
    });
}


// initialize everything
var plugin = null;

reset();
el.line.focus();

el.terminalWrap.onclick = function(e) {
    if (!window.getSelection().toString()) {
        el.line.focus();
        e.preventDefault();
    }  // otherwise text selected
}

