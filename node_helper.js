var NodeHelper = require("node_helper");
var fetcher = require('./fetcher');

module.exports = NodeHelper.create({
    socketNotificationReceived: function (notification, payload) {
        if (notification === "INIT") {
            this.initialize(payload);
        } else if (notification === "FETCH_RELEASE") {
            this.fetchRelease(payload);
        } else if (notification === "FETCH_COLLECTION") {
            this.fetchCollection(payload);
        } else if (notification === "FETCH_RELEASE") {
            this.fetchRelease(payload);
        }else if(notification === "FETCH_COLLECTION"){
            this.fetchCollection(payload);
        }
    },
    
    init: function (config) {
        var self = this;
        if(typeof config != "undefined") {
            fetcher.init(config.apiToken, config.username, function (result) {
                if (!result) {
                    self.sendSocketNotification("ERROR", "noCredentialsError");
                }
            });
        }
    },

    initialize: function (config) {
        var self = this;
        fetcher.init(config.apiToken, config.username, function (result) {
            if (!result) {
                self.sendSocketNotification("ERROR", "noCredentialsError");
            } else {
                self.sendSocketNotification("INIT_COMPLETE");
            }
        });
    },

    fetchCollection: function () {
        var self = this;
        fetcher.fetchCollection(function (ids) {
            self.sendSocketNotification("NEW_DATA_IDS", ids);
        });
    },

    fetchRelease: function (id) {
        var self = this;
        fetcher.fetchDetails(id, function (data) {
            if (typeof data === "string" && data.indexOf("error") != -1) {
                self.sendSocketNotification("ERROR", "fetchingError");
            }
            self.sendSocketNotification("NEW_DATA_RELEASE", data);
        });
    }
});