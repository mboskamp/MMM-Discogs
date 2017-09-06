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

/**
 * Performs an asynchronous fetch to the Discogs.com database. If the result is paged, all pages will be requested and a
 * list of record ids is created.
 * @param page The specific page number that will be fetched.
 * @param callback A function that is called after the fetch is done.
 */
function asyncFetch(page, callback) {
    fetcher.col.getReleases(fetcher.user, 0, {page: page, per_page: 100}, function (err, data) {
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

/**
 * Is called when all fetches are done. If new fetch tasks were scheduled in the meantime they will be added to the
 * task list. Finally if all tasks are done the callback is called.
 * @param callback A function that is called after all fetch tasks are done.
 */
function allFetchesDone(callback) {
    if (items.length == 0) {
        console.log("Fetching collection done. " + ids.length + " records found.");
        util.call(callback);
    } else {
        addItemsAsTask();
        async.parallel(asyncTasks, function () {
            allFetchesDone(callback);
        });
    }
};

/**
 * Adds planned requests to a list of asynchronous fetch tasks.
 */
function addItemsAsTask() {
    items.forEach(function (item) {
        asyncTasks.push(function (callback) {
            asyncFetch(item, function () {
                util.call(callback);
            });
        });
    });
};

/**
 * Fetches release information on a specific release with a given id.
 * @param id The id of a release in the Discogs.com database.
 * @param callback
 */
function getReleaseInformation(id, callback) {
    fetcher.db.getRelease(id, function (err, data) {
        try {
            current = {
                "id": data.id,
                "artist": data.artists[0].name,
                "title": data.title,
                "year": data.year,
                "format": data.formats[0].name,
                "imgurl": data.images[0].resource_url
            };
            util.trackListTohhmmss(data.tracklist, function (duration) {
                current.duration = duration;
                loadImage(callback);
            });
        } catch (err) {
            console.log("An error occurred: ");
            console.log("data: " + data);
            console.log("err: " + err);
        }
    });
};

/**
 * Downloads a record cover image to the /cover folder if necessary.
 * @param callback
 */
function loadImage(callback) {
    fs.readdir(appRoot + "/cover", function (err, files) {
        if (files.indexOf(current.id + ".jpg") == -1) {
            fetcher.db.getImage(current.imgurl, function (err, data, rateLimit) {
                if(err){
                    console.log("Error fetching image " + current.id + ".jpg: " + err);
                }else {
                    var imgPath = appRoot + "/cover/" + current.id + ".jpg";
                    fs.writeFile(imgPath, data, 'binary', function (err) {
                        if (err == null) {
                            console.log(current.id + ".jpg was written to: " + imgPath);
                        }
                    });
                }
            });
        }
    });
    util.call(callback);
};

/**
 * Performs a simple check on the given user credentials. The API token must be 40 characters long and the username must not be empty.
 * @returns {boolean} true if both conditions are met, otherwise false.
 */
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
    current = {};
    getReleaseInformation(id, function () {
        util.call(callback, current);
    });
};

/**
 * The fetcher will connect to the Discogs.com database and will gather all releases of the users collection.
 * @param callback If non-null and of type function the callback will be executed after all fetches are done.
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