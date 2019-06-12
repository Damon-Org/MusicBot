const
    fs = require('fs'),
    url = require('url'),
    mongodb = require('mongodb'),
    queryString = require('query-string'),
    validUrl = require('valid-url'),
    config = JSON.parse(fs.readFileSync(global.PATH +'/data/config.json')),
    { DiscordAPIError } = require('discord.js');

let
    API = null;

setTimeout(function () {
    API = global.api;
}, 1);

function AddSongToQueue(msgObj, voicechannel, textchannelId, song, userId, funCallback = null, sendMsgToChannel = true) {
    const
        music = global.MusSys,
        serverId = msgObj.guild.id;

    if (music.hasQueue(serverId)) {
        if (music.isDamonInVC(voicechannel)) {
            return music.addToQueue(serverId, song, userId, title => {
                if (funCallback != null) {
                    funCallback(title);
                }

                if (sendMsgToChannel) {
                    return msgObj.channel.send('Added song **'+ title +'**');
                }
            });
        }

        return msgObj.reply('you aren\'t in the bot its channel!');
    }
    else {
        music.createQueue(serverId, song, textchannelId, userId, title => {
            music.startQueue(serverId, voicechannel, () => {
                if (funCallback != null) {
                    setTimeout(function () {
                        funCallback();
                    }, 500);
                }

                return msgObj.channel.send('Playback starting with **'+ title +'**');
            });
        });
    }
}

function HandleException(err, data = null) {
    if (err instanceof DiscordAPIError) {
        if (err.message == 'Unknown Message') {
            return console.log('Ignoring error unknown message...');
        }
    }

    console.error(err);

    if (!fs.existsSync(global.PATH + '/log/')) {
        fs.mkdirSync(global.PATH + '/log/');
    }

    fs.appendFile(global.PATH + '/log/error.log', '-----On '+ new Date() +'-----\n' + err.stack + '\n-----End of Error-----\n\n', function (err) {
        if (err) throw err;
    });
}

function GetHighestQualityThumbnail(thumbnails) {
    let
        lastWidth = 0,
        lastHeight = 0,
        thumbnail = '';

    for (var i = 0; i < thumbnails.length; i++) {
        if (lastWidth < thumbnails[i].width || lastHeight < thumbnails[i].height) {
            lastWidth = thumbnails[i].width;
            lastHeight = thumbnails[i].height;
            thumbnail = thumbnails[i].url;
        }
    }

    return thumbnail;
}

function IsValidDomain(domain) {
    if (validUrl.isWebUri(domain)) {
        return true;
    }

    return false;
}

function OverflowText(text, maxChars, delimiter='...') {
    if (text.length > maxChars) {
        text = text.substring(0, maxChars - 3) + delimiter;
    }

    return text;
}

function Timer(funCallback, delay) {
    let self = this;

    self.created = Date.now();
    self.start = null;
    self.timerId = null;
    self.remaining = delay;

    self.paused = false;

    self.pause = function() {
        clearTimeout(self.timerId);
        self.remaining -= Date.now() - self.start;
        self.paused = true;
    };

    self.resume = function() {
        self.start = Date.now();
        clearTimeout(self.timerId);
        self.timerId = setTimeout(funCallback, self.remaining);
        self.paused = false;
    };

    self.destroy = function () {
        clearTimeout(self.timerId);
    }

    self.resume();
}

async function validateRequest(song, callback) {
    let
        list = undefined,
        videoId = '',
        parsedUrl = url.parse(song),
        domain = parsedUrl.hostname;

    if (domain.includes('youtube') || domain.includes('youtu.be')) {
        if (domain == 'youtu.be') {
            videoId = parsedUrl.pathname.split('/')[1];
        }
        else {
            videoId = queryString.parse(parsedUrl.search).v;

            list = queryString.parse(parsedUrl.search).list;
        }

        if (videoId != undefined) {
            return callback({source: 'yt', id: videoId, list: list});
        }
    }

    if (domain.includes('soundcloud.com')) {
        api.resolveSoundCloud(song, (res) => {
            if (res.kind != 'track') {
                return callback(false);
            }

            return callback({source: 'sc', id: res.id});
        });
    }

    return false;
}


/*
 *  User related functions
 */
function AddCooldown(userId, cmd, time) {
    global.conn.collection('users').updateOne(
        { discord_id: userId },
        {
            $push: {
                cooldowns: {
                    command: cmd,
                    timestamp: (Date.now() + time*1000)
                }
            }
        }
    );
}

function CreateUser(userId) {
    global.conn.collection('users').insertOne({
        discord_id: userId
    });
}

function HasCoolDown(userObj, cmd, time, funCallback) {
    const userId = userObj.id;
    UserExist(userId, result => {
        if (result == false) return funCallback(result);
        if (result.cooldowns == undefined) {
            AddCooldown(userId, cmd, time);
            return funCallback(false);
        }

        return SearchCooldown(userId, cmd, time, result => {
            if (!result) {
                return funCallback(result);
            }

            let lastCooldown4Cmd = result.cooldowns.filter(cooldown => cooldown.command == cmd).reverse()[0];

            if (lastCooldown4Cmd == undefined) {
                AddCooldown(userId, cmd, time);
                return funCallback(false);
            }

            if (lastCooldown4Cmd.timestamp <= Date.now()) {
                AddCooldown(userId, cmd, time);
                return funCallback(false);
            }

            return funCallback(true);
        });
    });
}

function SearchCooldown(userId, cmd, time, funCallback) {
    global.conn.collection('users').findOne({discord_id: userId}, (err, result) => {
        if (err) {
            throw err;
        }

        if (result != null) {
            return funCallback(result);
        }

        AddCooldown(userId, cmd, time);

        return funCallback(false);
    });
}

function UserExist(userId, funCallback) {
    global.conn.collection('users').findOne({discord_id: userId}, (err, result) => {
        if (err) {
            throw err;
        }

        if (result != null) {
            return funCallback(result);
        }

        CreateUser(userId);

        return funCallback(false);
    });
}

module.exports = {
    AddSongToQueue:AddSongToQueue,
    HandleException:HandleException,
    GetThumbnail:GetHighestQualityThumbnail,
    HasCoolDown:HasCoolDown,
    OverflowText:OverflowText,
    validateRequest:validateRequest,
    IsValidDomain:IsValidDomain,
    Timer:Timer
};
