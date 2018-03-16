var ids;
var errors = {
    noCredentialsError: "Please specify your Discogs API token and username in config.js. Get your API token at https://www.discogs.com/settings/developers",
    fetchingError: "Error while fetching"
};
var updateInterval;
var updateCounter;

function getRandomRelease() {
    var ran = Math.floor(Math.random() * (ids.length - 1));
    return ids[ran];
}

Module.register("MMM-Discogs", {

    defaults: {
        apiToken: "",
        username: "",
        updateDomInterval: 10 * 60 * 1000, //10 minutes
        fetchCollection: 50, //update collection every 50 update dom events
        animationSpeed: 750
    },

    start: function () {
        var self = this;

        updateCounter = self.defaults.fetchCollection;

        if (this.config.apiToken == "" || this.config.username == "") {
            this.error = errors.noCredentialsError;
        } else {
            this.error = false;
            self.sendSocketNotification("INIT", this.config);
        }
    },

    getDom: function () {
        var wrapper = document.createElement("div");
        if (!this.loaded) {
            if (this.error) {
                wrapper.innerHTML = this.error;
            } else {
                wrapper.innerHTML = this.translate("LOADING");
            }
        } else {
            wrapper.className = "discogs-wrapper";

            var cover = document.createElement("div");
            cover.className = "discogs-cover";
            cover.setAttribute("style", "background-image: url('modules/MMM-Discogs/cover/" + this.release.id + ".jpg')");
            wrapper.appendChild(cover);

            var descsription = document.createElement("div");
            descsription.className = "discogs-description";

            var artist = document.createElement("div");
            artist.className = "discogs-artist";
            artist.innerHTML = this.release.artist;

            var title = document.createElement("div");
            title.className = "discogs-title";
            title.innerHTML = this.release.title + (this.release.year == 0 ? "" : " (" + this.release.year + ")");

            var duration = document.createElement("div");
            duration.className = "discogs-duration";
            duration.innerHTML = this.release.duration;


            descsription.appendChild(artist);
            descsription.appendChild(title);
            descsription.appendChild(duration);
            wrapper.appendChild(descsription);
        }
        return wrapper;
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "NEW_DATA_RELEASE") {
            this.loaded = true;
            this.release = payload;
            this.updateDom(this.config.animationSpeed);

        } else if (notification === "NEW_DATA_IDS") {
            ids = payload;
            updateCounter = this.defaults.fetchCollection;
            this.fetchRelease();

        } else if (notification === "INIT_COMPLETE") {
            this.fetchCollection();

        } else if (notification === "ERROR") {
            this.loaded = false;
            this.error = errors[payload];
        }
    },

    getStyles: function () {
        return ["mmm-disocogs-style.css"];
    },

    getCommands: function(commander) {
          commander.add({
              command: 'discogsNext',
              callback: 'fetchRelease',
              description: "Get the next release from Discogs.",
          })
        },

    fetchCollection: function () {
        updateCounter = this.defaults.fetchCollection;
        this.sendSocketNotification("FETCH_COLLECTION");
    },

    fetchRelease: function () {
        var self = this;
        window.clearInterval(updateInterval);
        self.sendSocketNotification("FETCH_RELEASE", getRandomRelease());
        updateInterval = setInterval(function () {
            self.sendSocketNotification("FETCH_RELEASE", getRandomRelease());
            updateCounter--;
            if (updateCounter <= 0) self.fetchCollection();
        }, self.config.updateDomInterval);
    }
});