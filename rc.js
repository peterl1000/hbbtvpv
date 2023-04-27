let socket = undefined;
let connid = undefined;

function initrc() {
    socket = io();

    socket.on("send connection id", (id) => {
        console.log("RC: Connection ID received from server: " + id);
        connid = id;
        setRCInfo("Connection ID: " + id);
    });

    socket.on("play video", (srcid, url, stype, ptype) => {
        console.log("RC: play video, url: " + url);
        videourl = url;
        streamtype = stype;
        playbacktype = ptype;

        stopMediaPlayer(player);
        player.destroy();
        delete player;
        player = initMediaPlayer();
        updateURL();
        startVideo();
    });
}

function setRCInfo(text) {
    let ele = document.getElementById("rcinfo");
    ele.innerHTML = text;
}
