// Video URL can be specified using the "v" parameter in the page URL
// e.g. ?v=http://rdmedia.bbc.co.uk/dash/ondemand/testcard/1/client_manifest-events.mpd
// Otherwise a default video is used

const StreamType = {
    "DASH": "DASH",
    "HLS": "HLS"
}
const PlaybackType = {
    "JSLIB": "JSLIB",   // Playback using Javascript library - dash.js or hls.js
    "VE": "VE"     // Playback directly in the Video element
}

// These global variables are used to store state
let streamtype = undefined;
let playbacktype = undefined;
let videourl = undefined;

// Enable or disable Remote Control
const ENABLERC = false;

const DEFAULTVIDEOURL = "https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd";
const DEFAULTSTREAMTYPE = "DASH";
const DEFAULTPLAYBACKTYPE = "JSLIB";
let player;
const VideoState = {
    STOPPED: 0,
    PLAYING: 1
}
let videostate = VideoState.STOPPED;

// app entry function
function hbbtvpv_init() {
    // Fill in global variables based on URL
    getParamsFromURL();
    // Initiate the media player, using the global variables
    player = initMediaPlayer();

    if(ENABLERC === true) {
        initrc();
    }

    try {
        // attempt to acquire the Application object
        var appManager = document.getElementById('applicationManager');
        var appObject = appManager.getOwnerApplication(document);

        // check if Application object was a success
        if (appObject === null) {
            // error acquiring the Application object!
        } 
        else {
            // Register the keyset
            const MASK_CONSTANT_RED = 0x1;
            const MASK_CONSTANT_GREEN = 0x2;
            const MASK_CONSTANT_BLUE = 0x8;
            appObject.privateData.keyset.setValue(MASK_CONSTANT_RED +
                                                  MASK_CONSTANT_BLUE +
                                                  MASK_CONSTANT_GREEN);

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

function getParamsFromURL() {
    videourl = queryURLParameter("v");
    if(videourl === undefined) {
        videourl = DEFAULTVIDEOURL;
    }
    console.log("Video URL: " + videourl);

    let streamtypefromurl = queryURLParameter("t");
    if(streamtypefromurl in StreamType) {
        streamtype = StreamType[streamtypefromurl];
    } else {
        // Test if the stream type looks like HLS...
        if(looksLikeHLS(videourl)) {
            console.log("Guessing this is an HLS stream from the URL ending");
            streamtype = StreamType["HLS"];
        } else {
            streamtype = StreamType[DEFAULTSTREAMTYPE];
        }
    }

    let playbacktypefromurl = queryURLParameter("p");
    if(playbacktypefromurl in PlaybackType) {
        playbacktype = PlaybackType[playbacktypefromurl];
    } else {
        playbacktype = PlaybackType[DEFAULTPLAYBACKTYPE];
    }
}

function looksLikeHLS(url) {
    return url.endsWith(".m3u") || url.endsWith(".m3u8");
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
            toggleRCInfo();
            break;

        case 71: // g
        case 404: // hopefully this is "green"
            swapPlaybackType();
            break;

        default:
            break;
    }
}

function onClick() {
    if(videostate !== VideoState.PLAYING) {
        startVideo();
    }
}

function toggleTextbox() {
    let e = document.getElementById("textbox");
    e.classList.toggle('fadeout');
}

function toggleAVInfo() {
    let e = document.getElementById("avinfo");
    e.classList.toggle('fadeout');
}

function toggleRCInfo() {
    let e = document.getElementById("rcinfo");
    e.classList.toggle('fadeout');
}

function startVideo() {
    if(videostate === VideoState.PLAYING) {
        stopMediaPlayer(player);
    }
    videostate = VideoState.PLAYING;
    startMediaPlayer(player, videourl);
}

function initMediaPlayer() {
    let rplayer = undefined;
    let v = document.getElementById("videoplayer");

    if(playbacktype === PlaybackType.JSLIB) {
        // JSLIB playback
        switch(streamtype) {
            case StreamType.DASH:
                console.log("Stream type: MPEG-DASH");
                rplayer = new DASHMediaPlayer(v);
                break;

            case StreamType.HLS:
                console.log("Stream type: HLS");
                rplayer = new HLSMediaPlayer(v);
                break;
        
            default:
                console.log("Stream type: unknown");
                break;
        }
    } else if(playbacktype === PlaybackType.VE) {
        console.log("Stream type: Video element");
        rplayer = new VEMediaPlayer(v);
    } else {
        console.log("Unknown playback type");
    }

    return rplayer;
}

function startMediaPlayer(player, url) {
    player.startMediaPlayer(url);
}

function stopMediaPlayer(player) {
    player.stopMediaPlayer();
    videostate = VideoState.STOPPED;
}


function queryURLParameter(query) {
    // From https://stackoverflow.com/questions/5448545/how-to-retrieve-get-parameters-from-javascript
    let queryDict = {};
    location.search.substr(1).split("&").forEach(function(item) {queryDict[item.split("=")[0]] = item.split("=")[1]});
    return queryDict[query];
}

function setAVInfo(text) {
    let ele = document.getElementById("avinfo");
    ele.innerHTML = text;
}

function swapPlaybackType() {
    if(playbacktype === PlaybackType.JSLIB) {
        playbacktype = PlaybackType.VE;
    } else if(playbacktype === PlaybackType.VE) {
        playbacktype = PlaybackType.JSLIB;
    } else {
        console.error("Unknown playback type");
    }

    stopMediaPlayer(player);
    player.destroy();
    delete player;
    player = initMediaPlayer();
    updateURL();
    startVideo();
}

// Updates the URL based on the global variables
function updateURL() {
    let currenturl = window.location.href;
    console.log("Current URL is: " + currenturl);
    // Strip out the parameters
    let cleanurl = removeParam('p', currenturl);
    cleanurl = removeParam("t", cleanurl);
    cleanurl = removeParam("v", cleanurl)
    console.log("Clean URL is: " + cleanurl);
    
    let newparams = "?v=" + videourl;
    newparams += "&t=" + streamtype;
    newparams += "&p=" + playbacktype;
    let newurl = cleanurl + newparams;

    console.log("New URL is: " + newurl);

    // Update the URL
    history.replaceState(null, "", newurl);
}

// Borrowed from https://stackoverflow.com/questions/16941104/remove-a-parameter-to-the-url-with-javascript
function removeParam(key, sourceURL) {
    var rtn = sourceURL.split("?")[0],
        param,
        params_arr = [],
        queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
    if (queryString !== "") {
        params_arr = queryString.split("&");
        for (var i = params_arr.length - 1; i >= 0; i -= 1) {
            param = params_arr[i].split("=")[0];
            if (param === key) {
                params_arr.splice(i, 1);
            }
        }
        if (params_arr.length) rtn = rtn + "?" + params_arr.join("&");
    }
    return rtn;
}
