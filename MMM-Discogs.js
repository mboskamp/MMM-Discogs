Module.register("MMM-Discogs",{

    defaults: {
        apiToken: "iOrDCbhdyeHYnnFmSXoAbaFhFqFkxmSginyKzAyX",
        username: "TestSubjekt",
        updateInterval: 7000,
        animationSpeed: 750
    },

    start: function () {
        Log.info("Starting module: " + this.name);
        var self = this;
        self.sendSocketNotification("FETCH_NEW", {"apiToken":self.defaults.apiToken, "username": self.defaults.username});
        setInterval(function() {
            self.sendSocketNotification("FETCH_NEW", {"apiToken":self.defaults.apiToken, "username": self.defaults.username});
            self.updateDom(this.defaults.animationSpeed);
        }, this.defaults.updateInterval);
    },

    getDom: function() {
        var wrapper = document.createElement("div");
        if(!this.loaded){
            wrapper.innerHTML = this.translate("LOADING")
        }else{
            wrapper.id = "discogs-wrapper";

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

    socketNotificationReceived: function(notification, payload) {
        if (notification === "NEW_DATA") {
            this.loaded = true;
            this.release = payload;
        }
    },
    getStyles: function () {
        return [
            'style.css'
        ];
    },
});
