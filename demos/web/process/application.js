var scripts = document.getElementsByTagName('script');
var path = scripts[scripts.length-1].src
    .split('/')
    .slice(0, -1)
    .join('/')+'/';


// component shortcuts
var el = {};
var list = [
    'input_data',
    'output_data',
    'button_regen_input',
    'button_process',
    'code'
];

for (var i = 0; i < list.length; i++){
    el[list[i]] = document.getElementById(list[i]);
}

// generates random input and puts it into input field
var input;
function regen_input() {
    input = [];
    var len = 10;
    for (var i = 0; i < len; i++) {
        input.push(Math.floor(Math.random()*10));
    }

    el.input_data.innerHTML = stringify(input);
}


// processes the input data using provided code
function process() {
    var code = el.code.innerText;
    var input = el.input_data.innerText;

    var plugin =  new jailed.Plugin(path+'plugin.js');
    var process = function() {
        var displayResult = function(result) {
            el.output_data.innerHTML = stringify(result);
        }

        plugin.remote.process(input, code, displayResult);
    }

    plugin.whenConnected(process);
}


// converts an object into a string
function stringify(object) {
    var result;

    if (typeof object == 'undefined') {
        result = 'undefined';
    } else if (object === null) {
        result = 'null';
    } else {
        result = JSON.stringify(object) || object.toString();
    }

    return result;
}



// removes spaces from the end of the strings
function trim_tails(string) {
    var arr = string.split('\n');

    for (var i = 0; i < arr.length; i++) {
        arr[i] = arr[i].replace(/[\s\uFEFF\xA0]+$/g, '');
    }

    return arr.join('\n');
}

// fills the processing code textarea with initial content
function fill_code() {
    var code = trim_tails([
        'function(input) {                                 ',
        '    // bubble sorting the input array             ',
        '                                                  ',
        '    // switches the two elems if needed           ',
        '    // returns true if switched                   ',
        '    function switchEls(idx) {                     ',
        '        var switched = false;                     ',
        '        if (input[idx] < input[idx-1]) {          ',
        '            var tmp = input[idx];                 ',
        '            input[idx] = input[idx-1];            ',
        '            input[idx-1] = tmp;                   ',
        '            switched = true;                      ',
        '        }                                         ',
        '        return switched;                          ',
        '    }                                             ',
        '                                                  ',
        '    var switched;                                 ',
        '    do {                                          ',
        '        switched = false;                         ',
        '        for (var i = 1; i < input.length; i++) {  ',
        '            switched |= switchEls(i);             ',
        '        }                                         ',
        '    } while(switched);                            ',
        '                                                  ',
        '    return input;                                 ',
        '}                                                 ',
        '                                                  ',
        '                                                  '
    ].join('\n'));

    el.code.innerHTML = code;
}



// initializes everything
el.button_regen_input.onclick = regen_input;
el.button_process.onclick = process;
fill_code();

regen_input();
