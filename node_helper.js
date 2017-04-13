var NodeHelper = require("node_helper");
var fetcher = require('./fetcher');

module.exports = NodeHelper.create({
    start: function () {
        console.log("Starting node_helper for module: " + this.name);
    },

    socketNotificationReceived: function (notification, payload) {
        console.log("MMM-DISCOGS: node_helper received: " + notification);
        console.log("with payload: " + payload);

        if(notification === "INIT"){
            this.init(payload);
        }
        else if (notification === "FETCH_RELEASE") {
            this.fetchRelease(payload);
        }else if(notification === "FETCH_COLLECTION"){
            this.fetchCollection(payload);
        }
    },
    
    init: function (config) {
        console.log("Initializing fetcher");
        var self = this;
        fetcher.init(config.apiToken, config.username,function (result) {
            console.log("Initalization " + result ? "successful" : "failed");
            if(!result){
                self.sendSocketNotification("ERROR", "noCredentialsError");
            }
        });
    },

    fetchCollection: function () {
        console.log("Start fetching collection");
        var self = this;
        fetcher.fetchCollection(function (ids) {
            self.sendSocketNotification("NEW_DATA_IDS",ids);
        });
    },
    
    fetchRelease: function (id) {
        console.log("Start fetching information on release: " + id);
        var self = this;
        fetcher.fetchDetails(id, function (data) {
            if (typeof data === "string" && data.indexOf("error") != -1) {
                self.sendSocketNotification("ERROR", "fetchingError");
            }
            self.sendSocketNotification("NEW_DATA_RELEASE", data);
        });
    }
});