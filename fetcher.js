var path = require('path');
var Discogs = require('disconnect').Client;
var async = require('async');
var fs = require('fs');
var util = require('./util.js');

var appRoot = __dirname;

var fetcher = {};
fetcher.user = "";
fetcher.API_TOKEN = "";
fetcher.discogs;

var ids = [];
var pages = 1;
var asyncTasks = [];
var items = [];
var firstPage = true;

var current = {};

var finalcallback;

function asyncFetch(page, callback) {
    console.log("fetch page " + page);
    fetcher.col.getReleases(fetcher.user, 0, {page: page, per_page: 50}, function (err, data) {
        if (err) {
            finalcallback("error: " + err.message);
            return;
        }
        items.splice(0, 1);
        asyncTasks.splice(0, 1);
        if (firstPage) {
            firstPage = false;
            pages = data.pagination.pages;
            for (var i = 2; i <= pages; i++) {
                items.push(i);
            }
        }
        for (var i = 0; i < data.releases.length; i++) {
            ids.push(data.releases[i].id);
        }
        util.call(callback);
    });
};

function allFetchesDone(callback, callback2) {
    console.log("items length: " + items.length);
    if (items.length == 0) {
        console.log("Fetching done. " + ids.length + " items fetched.");
        util.call(callback, callback2);
    } else {
        addItemsAsTask();
        async.parallel(asyncTasks, function () {
            allFetchesDone(callback);
        });
    }
};

function addItemsAsTask() {
    console.log("items.length: " + items.length);
    items.forEach(function (item) {
        asyncTasks.push(function (callback) {
            asyncFetch(item, function () {
                util.call(callback);
            });
        });
    });
};

function getReleaseInformation(id, callback) {
    fetcher.db.getRelease(id, function (err, data) {
        current = {
            "id": data.id,
            "artist": data.artists[0].name,
            "title": data.title,
            "year": data.year,
            "trackList": data.tracklist,
            "format": data.formats[0].name,
            "imgurl": data.images[0].resource_url
        };
        util.trackListTohhmmss(data.tracklist, function (duration) {
            current.duration = duration;
        });
        loadImage(callback);
    });
};


function loadImage(callback) {
    fs.readdir(appRoot + "/cover", function (err, files) {
        if (files.indexOf(current.id + ".jpg") != -1) {
            console.log("We already have that image :-)");
        } else {
            fetcher.db.getImage(current.imgurl, function (err, data, rateLimit) {
                console.log("Rate limit: " + rateLimit);
                var imgPath = appRoot + "/cover" + current.id + ".jpg";
                fs.writeFile(imgPath, data, 'binary', function (err) {
                    if(typeof err === "undefined"){
                        console.log(current.id + ".jpg was written to: " + imgPath);
                    }
                });
            });
        }
        util.call(callback);
    });
};

function validateCredentials() {
    return fetcher.API_TOKEN.length == 40 && fetcher.user != "";
}

/**
 * Initialization of a fetcher instance. All parameters are required and are set as instance variables.
 * Returns true if all parameters are valid, false otherwise.
 * @param apiToken The Discogs API token. See https://www.discogs.com/settings/developers
 * @param username The Discogs name of the user whose collection will be fetched.
 * @param callback The callback function will be executed after the initialization.
 * The parameter will be true if apiToken and username meet the expectations, false otherwise.
 */
fetcher.init = function (apiToken, username, callback) {
    this.API_TOKEN = apiToken;
    this.user = username;
    fetcher.discogs = new Discogs({userToken: this.API_TOKEN});
    fetcher.db = fetcher.discogs.database();
    fetcher.col = fetcher.discogs.user().collection();
    util.call(callback, validateCredentials());
};

/**
 * The fetcher will connect to the Discogs.com database and fetch information on the release with the given id.
 * @param id The release id
 * @param callback A callback that will be executed after the fetch is completed. The release data will be passed as a parameter.
 */
fetcher.fetchDetails = function (id, callback) {
    console.log("fetchDetails for id: " + id);
    getReleaseInformation(id, function () {
        util.call(callback, current);
    });
};

/**
 * The fetcher will connect to the Discogs.com database and will gather all releases of the users collection.
 * @param callback TODO:
 * @throws NoUserCredentialsError The intialization must be performed before fetching from the database.
 */
fetcher.fetchCollection = function (callback) {
    if (!validateCredentials()) throw "NoUserCredentialsError";

    firstPage = true;
    ids = [];

    items.push(1);
    addItemsAsTask();
    async.parallel(asyncTasks, function () {
        allFetchesDone(function () {
            util.call(callback, ids);
        });
    });
};

module.exports = fetcher;