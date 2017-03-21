var util = {};

util.trackListTohhmmss = function (trackList, callback) {
    var sec = 0;
    trackList.forEach(function (track) {
        if (track.duration != '') {
            var dur = track.duration.split(":");
            sec += parseInt(dur[0]) * 60;
            sec += parseInt(dur[1]);
        }
    });

    var min = Math.floor(sec / 60);
    var h = 0;
    if (min > 59) {
        h = Math.floor(sec / 3600);
        min -= (h * 60);
    }
    sec -= ((h * 3600) + (min * 60));
    if (typeof callback === "function") callback(sec == 0 ? "" : ((h == 0 ? "" : (String(h).length == 1 ? "0" + h : h ) + "h ") + (String(min).length == 1 ? "0" + min : min) + "m " + (String(sec).length == 1 ? "0" + sec : sec) + "s"));
};

module.exports = util;