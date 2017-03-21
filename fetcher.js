var path = require('path');
var Discogs = require('disconnect').Client;
var async = require('async');
var fs = require('fs');
var util = require('./util.js');

var appRoot = __dirname;

var fetcher = {};
var ids = [];
var pages = 1;
var asyncTasks = [];
var items = [];
var firstPage = true;

fetcher.user = "";
fetcher.API_TOKEN = "";
var discogs;

var col;
var db;

var current = {};

var finalcallback;


function asyncFetch(page, callback) {
    col.getReleases(fetcher.user, 0, {page: page, per_page: 10}, function (err, data) {
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
        if (typeof callback === "function") callback();
    });
};

function allFetchesDone(callback, callback2) {
    if (items.length == 0) {
        console.log("Fetching done. " + ids.length + " items fetched.");
        if (typeof callback === "function") callback(callback2);
    } else {
        addItemsAsTask();
        async.parallel(asyncTasks, function () {
            allFetchesDone(callback);
        });
    }
};

function addItemsAsTask() {
    items.forEach(function (item) {
        asyncTasks.push(function (callback) {
            asyncFetch(item, function () {
                if (typeof callback === "function") callback();
            });
        });
    });
};

function getRandomRelease(callback) {
    var ran = Math.floor(Math.random() * (ids.length - 1));
    db.getRelease(ids[ran], function (err, data) {
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
        })
        if (typeof callback === "function") callback();
    });
};


function loadImage(callback) {
    var imgs = fs.readdir(appRoot + "/cover", function (err, files) {
        if (files.indexOf(current.id + ".jpg") != -1) {
            console.log("We already have that image :-)");
            if (typeof callback === "function") callback();
        } else {
            db.getImage(current.imgurl, function (err, data, rateLimit) {
                fs.writeFile(appRoot + '/cover/' + current.id + '.jpg', data, 'binary', function (err) {
                    if (typeof callback === "function") callback();
                });
            });
        }
    });
};

function process() {
    getRandomRelease(function () {
        loadImage(final);
    });
};

function final() {
    finalcallback(current);
}

fetcher.fetch = function (apiToken, username, callback) {
    this.API_TOKEN = apiToken;
    this.user = username;
    discogs = new Discogs({userToken: this.API_TOKEN});
    col = discogs.user().collection();
    db = discogs.database();
    finalcallback = callback;

    firstPage = true;
    ids = [];

    items.push(1);
    addItemsAsTask();
    async.parallel(asyncTasks, function () {
        allFetchesDone(process);
    });
};

module.exports = fetcher;