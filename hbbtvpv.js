// Video URL can be specified using the "v" parameter in the page URL
// e.g. ?v=http://rdmedia.bbc.co.uk/dash/ondemand/testcard/1/client_manifest-events.mpd
// Otherwise a default video is used

const DEFAULTVIDEOURL = "https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd";
let player;
const VideoState = {
    STOPPED: 0,
    PLAYING: 1
}
let videostate = VideoState.STOPPED;

// app entry function
function hbbtvpv_init() {
    try {
        // create the media player - this is needed whether the app runs in an HbbTV
        // or standard browser
        player = dashjs_initMediaPlayer();

        // attempt to acquire the Application object
        var appManager = document.getElementById('applicationManager');
        var appObject = appManager.getOwnerApplication(document);

        // check if Application object was a success
        if (appObject === null) {
            // error acquiring the Application object!
        } 
        else {
            // Register the keyset
            const MASK_CONSTANT_RED = 0x1
            const MASK_CONSTANT_BLUE = 0x8;
            appObject.privateData.keyset.setValue(MASK_CONSTANT_RED + MASK_CONSTANT_BLUE);

            // we have the Application object, and we can show our app
            appObject.show();
            console.log("Running in HbbTV mode");
            startVideo();
        }
    }
    catch (e) {
        // this is not an HbbTV client, catch the error.
        console.log("Not running in HbbTV MODE, or error during start up");
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
            toggleAVInfo();
            break;

        default:
            break;
    }
}

function onClick() {
    //startVideo();
}

function toggleTextbox() {
    let e = document.getElementById("textbox");
    e.classList.toggle('fadeout');
}

function toggleAVInfo() {
    let e = document.getElementById("avinfo");
    e.classList.toggle('fadeout');
}

function startVideo() {
    let v = document.getElementById("videoplayer");
    let videourl = queryURLParameter("v");
    if(videourl === undefined) {
        videourl = DEFAULTVIDEOURL;
    }
    if(videostate === VideoState.PLAYING) {
        dashjs_stopDashMediaPlayer(player);
    }
    videostate = VideoState.PLAYING;
    dashjs_startDashMediaPlayer(player, v, videourl);
}

function dashjs_initMediaPlayer() {
    let player = {
      "player": undefined,
      "onAVInfoCallback": undefined,
      "avinfo": {} // The latest AV Info
    };
    player.player = dashjs.MediaPlayer({}).create();
    dashjs_local_initAVinfo(player.avinfo);
    return player;
}

function dashjs_startDashMediaPlayer(player, videoelement, url, servicetype, ttmlrenderingdiv = undefined) {
    player.player.initialize(videoelement, url, true);
    player.player.on(dashjs.MediaPlayer.events["REPRESENTATION_SWITCH"], (e) => {dashjs_localavinfocallback(player, e)});
}

function dashjs_stopDashMediaPlayer(player) {
    if(player.player !== undefined) {
        player.player.reset();
    }
}

function dashjs_local_initAVinfo(a) {
    a.video = undefined;
    a.audio = undefined;
    a.text = undefined;
}  

function dashjs_localavinfocallback(player, e) {
    if(e.mediaType === "video") {
        let sc;
        switch(e.currentRepresentation.scanType) {
        case("progressive"):
            sc = "p";
            break;
        case("interlaced"):
            sc = "i";
            break;
        default:
            if(e.currentRepresentation.scanType === null) {
                sc = "";
            } else {
                sc = e.currentRepresentation.scanType;
            }
            break;
        }

        let out = "<b>Video:</b>";//"VIDEO EVENT:";
        out += " Rep ID: <b>" + e.currentRepresentation.id + "</b>";
        out += " Format: <b>" + e.currentRepresentation.width + "x" + e.currentRepresentation.height
                        + sc + "</b>";
        out += " BW: <b>" + e.currentRepresentation.bandwidth / 1000000 + "Mb/s</b>";
        out += " Codec: <b>" + e.currentRepresentation.codecs + "</b>";
        avinfo.video = out;
    }
    if(e.mediaType === "audio") {
        let out = "<b>Audio:</b>";//"AUDIO EVENT:";
        out += " Rep ID: <b>" + e.currentRepresentation.id + "</b>";
        //out += " Timescale: <b>" + e.currentRepresentation.timescale + "</b>";
        out += " BW: <b>" + e.currentRepresentation.bandwidth / 1000 + "kb/s</b>";
        out += " Codec: <b>" + e.currentRepresentation.codecs + "</b>";
        avinfo.audio = out;
    }
    if(e.mediaType === "text") {
        let out = "<b>Text:</b>";//"TEXT EVENT:";
        out += " Rep ID: <b>" + e.currentRepresentation.id + "</b>";
        out += " BW: <b>" + e.currentRepresentation.bandwidth / 1000 + "kb/s</b>";
        out += " Codec: <b>" + e.currentRepresentation.codecs + "</b>";
        avinfo.text = out;
    }

    let text = (avinfo.video !== undefined ? avinfo.video  + "<br>" : "") +
               (avinfo.audio !== undefined ? avinfo.audio + "<br>" : "") +
               (avinfo.text !== undefined ? avinfo.text : "");
    if(text.length === 0) {
        text = "<i>Pending...</i>";
    }

    let ele = document.getElementById("avinfo");
    ele.innerHTML = text;

    // Save the latest AV Info so it can be got
    player.avinfo = avinfo;
}

function queryURLParameter(query) {
    // From https://stackoverflow.com/questions/5448545/how-to-retrieve-get-parameters-from-javascript
    let queryDict = {};
    location.search.substr(1).split("&").forEach(function(item) {queryDict[item.split("=")[0]] = item.split("=")[1]});
    return queryDict[query];
}
