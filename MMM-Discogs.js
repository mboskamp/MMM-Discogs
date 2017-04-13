var errors = {
    noCredentialsError: "Please specify your Discogs API token and username in config.js. Get your API token at https://www.discogs.com/settings/developers",
    fetchingError: "Error while fetching"
};

function getRandomRelease(){
    var ran = Math.floor(Math.random() * (this.ids.length - 1));
    return this.ids[ran];
}

Module.register("MMM-Discogs", {

    defaults: {
        updateInterval: 10 * 60 * 1000, //10 minutes
        fetchInterval: 60 * 60 * 1000, //every hour
        animationSpeed: 750
    },

    start: function () {
        Log.info("Starting module: " + this.name);
        var self = this;

        if (typeof this.config.apiToken === "undefined" || typeof this.config.username === "undefined") {
            this.error = errors.noCredentialsError;
        } else {
            this.error = false;
            self.sendSocketNotification("INIT", {
                "apiToken": self.config.apiToken,
                "username": self.config.username
            });
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
            artist.classNam = "discogs-artist";
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
        console.log("notification: " + notification);
        console.log("payload: " + payload);
        if (notification === "NEW_DATA_RELEASE") {
            this.loaded = true;
            this.release = payload;
            this.updateDom(this.config.animationSpeed);
        } else if (notification === "NEW_DATA_IDS") {
            this.ids = payload;
            setInterval(function () {
                this.sendSocketNotification("FETCH_RELEASE", getRandomRelease());
            }, this.config.updateInterval);
        } else if (notification === "INIT_COMPLETE") {
            setInterval(function () {
                this.sendSocketNotification("FETCH_COLLECTION");
            }, this.config.fetchInterval);
        } else if (notification === "ERROR") {
            this.loaded = false;
            this.error = errors[payload];
        }
    },
    getStyles: function () {
        return [
            'script.css'
        ];
    }
});
