var NodeHelper = require("node_helper");
var fetcher = require('./fetcher');

module.exports = NodeHelper.create({
    start: function() {
        console.log("Starting module: " + this.name);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "FETCH_NEW") {
            this.fetch(payload);
            return;
        }
    },

    fetch: function(config) {
        var self = this;
        fetcher.fetch(config.apiToken, config.username, function (data) {
            self.sendSocketNotification("NEW_DATA", data);
        });
    }
});
