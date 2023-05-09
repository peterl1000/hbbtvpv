# hbbtvpv

# This repository is deprecated, and replaced by hbbtvpv_rc.

Very basic HbbTV DASH and HLS video playback app, based on the HbbTV Hello World app: https://github.com/HbbTV-Association/Tutorials/tree/main/hello-world

The URL of a video for playback can be specified using the "?v=" parameter, otherwise a default video will be played.
URLs ending in .m3u or .m3u8 are assumed to be HLS, otherwise DASH playback will be attempted. This can be overridden using the t=DASH or t=HLS URL parameter.
Playback can be done using a Javascript library (dash.js or hls.js) or the browser's native video element. This can be specified using the parameter "p=JSLIB" or "p=VE". The Javascript library is the default.
