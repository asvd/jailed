
// potentially insecure 3rd-party partner code which may only
// perform what is permitted by the application

var bad = false;

// updates banner image and link
var update = function() {
    var image = bad ? 'bad.png' : 'good.png';
    var link = bad ? 'http://facebook.com/' : 'http://google.com';

    application.remote.setImage(image);
    application.remote.setLink(link);

    bad = !bad;
}

update();
setInterval(update, 2000);

