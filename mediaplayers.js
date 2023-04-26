// BASE CLASS - this should not be instantiated
class MediaPlayer {
    constructor(videoelement, ttmlrenderingdiv = undefined) {
        this.videoelement = videoelement;
        this.ttmlrenderingdiv = ttmlrenderingdiv;
    }

    startMediaPlayer(url) {
    }

    stopMediaPlyer() {
    }

    destructor() {
    }

    localavinfocallback(e) {
    }
}


// DASH FUNCTIONS
class DASHMediaPlayer extends MediaPlayer {
    constructor(videoelement, ttmlrenderingdiv) {
        super(videoelement, ttmlrenderingdiv);
        // let player = {
        // "player": undefined,
        // "onAVInfoCallback": undefined,
        // "avinfo": {} // The latest AV Info
        // };
        this.player = dashjs.MediaPlayer({}).create();
        this.onAVInfoCallback = undefined;
        this.avinfo = {};
        DASHMediaPlayer.dashjs_local_initAVinfo(this.avinfo);
    }

    startMediaPlayer(url) {
        this.player.initialize(this.videoelement, url, true);
        this.player.on(dashjs.MediaPlayer.events["REPRESENTATION_SWITCH"],
                                                 (e) => {this.localavinfocallback(e)});
    }

    stopMediaPlayer() {
        if(this.player !== undefined) {
            this.player.reset();
        }
    }

    destructor() {
        if(this.player !== undefined) {
            this.player.destroy();
        }
    }

    localavinfocallback(e) {
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

        let text = "<b>MPEG-DASH / dash.js</b><br>" +
                (avinfo.video !== undefined ? avinfo.video  + "<br>" : "") +
                (avinfo.audio !== undefined ? avinfo.audio + "<br>" : "") +
                (avinfo.text !== undefined ? avinfo.text : "");
        if(text.length === 0) {
            text = "<i>Pending...</i>";
        }

        setAVInfo(text);

        // Save the latest AV Info so it can be got
        this.avinfo = avinfo;
    }

    static dashjs_local_initAVinfo(a) {
        a.video = undefined;
        a.audio = undefined;
        a.text = undefined;
    }  
}
// END DASH FUNCTIONS

// HLS FUNCTIONS
class HLSMediaPlayer extends MediaPlayer {
    constructor(videoelement, ttmlrenderingdiv = undefined) {
        super(videoelement, ttmlrenderingdiv);
        // let player = {
        //     "player": undefined
        // }

        if (Hls.isSupported()) {
            this.player = new Hls();
            this.player.on(Hls.Events.MEDIA_ATTACHED, function () {
            console.log('video and hls.js are now bound together !');
            });
            this.player.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
                console.log(
                    'manifest loaded, found ' + data.levels.length + ' quality level'
                );
                //console.log(data);

                setAVInfo("<b>HLS / hls.js</b><br>Found " + data.levels.length + " quality levels");
            });
        }
    }

    startMediaPlayer(url) {
        this.player.loadSource(url);
        this.player.attachMedia(this.videoelement);
        this.videoelement.play();
    }

    stopMediaPlayer() {
        this.videoelement.pause();
    }

    destructor() {
        this.player.destroy();
    }
}
// END HLS FUNCTIONS

// VIDEO ELEMENT PLAYBACK
class VEMediaPlayer extends MediaPlayer {
    constructor(videoelement, ttmlrenderingdiv = undefined) {
        // let player = {
        //     "player": undefined
        // }
        super(videoelement, ttmlrenderingdiv);
    }

    startMediaPlayer(url) {
        let text = "<b>";
        if(streamtype === StreamType.DASH) {text += "MPEG-DASH"}
        else if(streamtype === StreamType.HLS) {text += "HLS"}
        else {text += "unknown"}
        text += " / video element</b><br>";
        text += "Using HTML Video element for playback";
        setAVInfo(text);
        this.videoelement.src = url;
        this.videoelement.play();
    }

    ve_stopMediaPlayer() {
        this.videoelement.pause();
    }

    destructor() {
        // Nothing to do
    }
}
// END VIDEO ELEMENT PLAYBACK
