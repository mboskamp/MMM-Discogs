var util = {};

/**
 * Helper function that converts the duration of a record in a given Discogs.com API response into a version that is human-readable.
 * @param trackList The track list that is part of a Discogs.com API response for a specific record. (JSON)
 * @param callback A function that is called after the conversion. The formatted result is passed as param. Should not be null. Must be a function.
 */
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
    util.call(callback, sec == 0 ? "" : ((h == 0 ? "" : (String(h).length == 1 ? "0" + h : h ) + "h ") + (String(min).length == 1 ? "0" + min : min) + "m " + (String(sec).length == 1 ? "0" + sec : sec) + "s"));
};

/**
 * Helper function for if(typeof callback === "function) callback();
 * @param callback A callback that will be executed if the passed callback is indeed a function.
 * @param param An optional parameter that will be passed to the callback if it is defined.
 */
util.call = function (callback, param) {
    if(typeof callback === "function"){
        if(param != null){
            callback(param);
        }else{
            callback();
        }
    }
};

module.exports = util;