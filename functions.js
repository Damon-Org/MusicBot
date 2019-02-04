const
    fs = require("fs"),
    url = require("url"),
    events = require('events'),
    eventEmitter = new events.EventEmitter(),
    queryString = require('query-string'),
    validUrl = require("valid-url"),
    yt = require("./youtube");

global.config = JSON.parse(fs.readFileSync("data/config.json"));
global.users = {};

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

exports.on_reaction = function (message, emoji) {
    const bot = global.bot;

    bot.on('messageReactionAdd', (reaction, user) => {
        return CheckReaction(reaction, user);
    });

    bot.on('messageReactionRemove', (reaction, user) => {
        return CheckReaction(reaction, user);
    });

    function CheckReaction(reaction, user) {
        if (user.id == bot.user.id) {
            return ;
        }
        else if (message.id == reaction.message.id && user.id != bot.user.id) {
            if (global.users[user.id] == undefined) {
                global.users[user.id] = {};
                global.users[user.id].timer = setTimeout(function () {
                    console.log("Event fired");
                    global.users[user.id] = undefined;
                }, 10);
            }
            else
                return ;
        }
    }
};

exports.validateRequest = async function (song, callback) {
    var
        videoId = "",
        parsedUrl = url.parse(song),
        domain = parsedUrl.hostname;

    if (domain.includes("youtube") || domain.includes("youtu.be")) {
        if (domain == "youtu.be")
            videoId = parsedUrl.pathname.split("/")[1];
        else
            videoId = queryString.parse(parsedUrl.search).v;

        if (!await yt.getSongInfoById(videoId))
            return false;

        if (videoId != undefined)
            return callback({source: "youtube", id: videoId});
        else
            return false;
    }
    return false;
};
