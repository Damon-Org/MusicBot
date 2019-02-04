const
    fs = require("fs"),
    url = require("url"),
    queryString = require('query-string'),
    validUrl = require("valid-url");

global.config = JSON.parse(fs.readFileSync("data/config.json"));

exports.IsValidDomain = function (domain) {
    if (validUrl.isWebUri(domain))
        return true;
    return false;
};

exports.on_command = function (msg, command, callback) {
    if (msg != undefined && msg.startsWith(config.prefix))
        if (msg.substring(config.prefix.length).split(" ")[0] == command)
            return callback(msg.substring(config.prefix.length + command.length + 1).split(" "));
    return false;
};

exports.validateRequest = function (song, callback) {
    var
        videoId = "",
        parsedUrl = url.parse(song),
        domain = parsedUrl.hostname;

    if (domain.includes("youtube") || domain.includes("youtu.be")) {
        if (domain == "youtu.be")
            videoId = parsedUrl.pathname;
        else
            videoId = queryString.parse(parsedUrl.search).v;

        if (videoId != undefined)
            return callback({source: "youtube", id: videoId});
        else
            return callback(false);
    }
    else return callback(false);
};
