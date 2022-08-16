// Video URL can be specified using the "v" parameter in the page URL
// e.g. ?v=http://rdmedia.bbc.co.uk/dash/ondemand/testcard/1/client_manifest-events.mpd
// Otherwise a default video is used

const DEFAULTVIDEOURL = "https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd";

// app entry function
function hbbtvpv_init() 
{
    try {
        // attempt to acquire the Application object
        var appManager = document.getElementById('applicationManager');
        var appObject = appManager.getOwnerApplication(document);
        // check if Application object was a success
        if (appObject === null) {
            // error acquiring the Application object!
        } 
        else {
            // we have the Application object, and we can show our app
            appObject.show();
            console.log("HBBTV MODE!");
            startVideo();
        }
    }
    catch (e) {
        // this is not an HbbTV client, catch the error.
        console.log("NOT HBBTV MODE!");
    }
}

function keyDown(event) {
    let keyCode = event.keyCode;
    console.log("Key code: " + keyCode);
    // Codes refer to keys, not characters!
    switch(keyCode) {
        case 82: // r
        case 403: // hopefully this is "red"
            startVideo();
            break;

        case 66: // b
        case 406: // hopefully this is "blue"
            toggleTextbox();
            break;

        default:
            break;
    }
}

function toggleTextbox() {
    let e = document.getElementById("textbox");

    e.classList.toggle('fadeout');
}

function startVideo() {
    let player = dashjs_initMediaPlayer();
    let v = document.getElementById("videoplayer");
    let videourl = queryURLParameter("v");
    if(videourl === undefined) {
        videourl = DEFAULTVIDEOURL;
    }
    dashjs_startDashMediaPlayer(player, v, videourl);
}

function dashjs_initMediaPlayer() {
    let player = {
      "player": undefined,
      "onAVInfoCallback": undefined,
      "avinfo": {} // The latest AV Info
    };
    player.player = dashjs.MediaPlayer({}).create();
    return player;
}

function dashjs_startDashMediaPlayer(player, videoelement, url, servicetype, ttmlrenderingdiv = undefined) {
    player.player.initialize(videoelement, url, true);
}

function queryURLParameter(query) {
    // From https://stackoverflow.com/questions/5448545/how-to-retrieve-get-parameters-from-javascript
    let queryDict = {};
    location.search.substr(1).split("&").forEach(function(item) {queryDict[item.split("=")[0]] = item.split("=")[1]});
    return queryDict[query];
}
