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

/* @function
 *  Adds a guild to the database if it doesn't exist yet
 */
function AddGuildToDB(guild) {
    const serverId = guild.id;

    global.conn.query(`SELECT guild_id FROM guilds WHERE serverId='${serverId}'`, (error, results, fields) => {
        if (error) {
            throw error;
        }

        if (results.length == 0) {
            global.conn.query(`INSERT INTO guilds (serverId, guild_name) VALUES (?, ?)`, [serverId, guild.name], (error, results, fields) => {
                if (error) {
                    throw error;
                }
            });
        }
    });
}

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

/* @function
 *  Handles all exceptions and logs these to a file, ignores unknown messages
 */
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

/* @function
 *  Gets a feature with a serverId and the internal_name of that feature
 */
function GetGuildOption(serverId, feature, funCallback) {
    global.conn.query(
        `SELECT value FROM settings INNER JOIN guilds ON settings.guild_id=guilds.guild_id WHERE settings.option_id = (SELECT option_id FROM options WHERE internal_name='${feature}') AND guilds.serverId = '${serverId}'`,
        (error, results, fields) => {
            if (error) {
                throw error;
            }

            if (results.length == 0) {
                return funCallback(null);
            }

            funCallback(results[0].value);
    });
}

/* @function
 *  Will select the highest quality thumbnail from the YT api
 */
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

/* @function
 *  Most basic check to for if a domain is valid
 */
function IsValidDomain(domain) {
    if (validUrl.isWebUri(domain)) {
        return true;
    }

    return false;
}

/* @function
 *  For if a text overflows a set amount of characters we will cut of the last characters to the maxChars and replace the last remaining chars with a delimiter
 */
function OverflowText(text, maxChars, delimiter='...') {
    if (text.length > maxChars) {
        text = text.substring(0, maxChars - delimiter.length) + delimiter;
    }

    return text;
}

/* @function
 *  Custom timer function
 */
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

/* @function
 *  Checks if a guild has a feature in the table, updates if it exists otherwise it inserts
 */
function UpdateGuildOption(serverId, feature, value) {
    global.conn.query(
        `SELECT setting_id FROM settings INNER JOIN guilds ON settings.guild_id=guilds.guild_id WHERE settings.option_id = (SELECT option_id FROM options WHERE internal_name='${feature}') AND guilds.serverId = '${serverId}'`,
        (error, results, fields) => {
            if (error) {
                throw error;
            }

            if (results.length == 0) {
                return global.conn.query(
                    `INSERT INTO settings (guild_id, option_id, value) VALUES ((SELECT guild_id FROM guilds WHERE serverId='${serverId}'), (SELECT option_id FROM options WHERE internal_name='${feature}'), '${value}')`,
                    (error, results, fields) => {
                        if (error) {
                            throw error;
                        }
                });
            }

            global.conn.query(
                `UPDATE settings SET value='${value}' WHERE setting_id = ${results[0].setting_id}`,
                (error, results, fields) => {
                    if (error) {
                        throw error;
                    }
                }
            )
    });
}

/* @function
 *  Does a last check for if the request was valid like correct domain and query being present
 */
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
            if (!res) {
                return callback(false);
            }

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
function AddCooldown(internal_id, cmd, time) {
    const timestamp = Date.now() + time * 1000;

    global.conn.query(`INSERT INTO cooldowns (internal_id, command_id, timestamp) VALUES (${internal_id}, (SELECT command_id FROM commands WHERE internal_name='${cmd}'), ${timestamp})`, (error, results, fields) => {
        if (error) {
            throw error;
        }
        return;
    })
}

function CreateUser(userId) {
    global.conn.query(`INSERT INTO users (discord_id) VALUES (${userId})`, (error, results, fields) => {
        if (error) {
            throw error;
        }
        return;
    });
}

function HasCoolDown(userObj, cmd, time, funCallback) {
    const userId = userObj.id;
    UserExist(userId, result => {
        if (result == false) return funCallback(result);

        return SearchCooldown(result, cmd, time, result => {
            if (!result) {
                return funCallback(result);
            }

            return funCallback(result);
        });
    });
}

function SearchCooldown(internal_id, cmd, time, funCallback) {
    const timestamp = Date.now();

    global.conn.query(`SELECT timestamp FROM cooldowns WHERE internal_id=${internal_id} AND command_id=(SELECT command_id FROM commands WHERE internal_name='${cmd}') AND timestamp > ${timestamp}`, (err, results, fields) => {
        if (err) {
            throw err;
        }

        if (results.length == 0) {
            AddCooldown(internal_id, cmd, time);
            return funCallback(false);
        }

        return funCallback(true);
    });
}

function UserExist(userId, funCallback) {
    global.conn.query(`SELECT * FROM users WHERE discord_id='${userId}'`, (error, results, fields) => {
        if (error) {
            throw error;
        }

        if (results.length == 0) {
            CreateUser(userId);

            return funCallback(false);
        }
        else if (results.length > 1) {
            throw 'Unexpected multiple results returned?';
        }

        return funCallback(results[0].internal_id);
    });
}

module.exports = {
    AddGuildToDB:AddGuildToDB,
    AddSongToQueue:AddSongToQueue,
    HandleException:HandleException,
    GetThumbnail:GetHighestQualityThumbnail,
    HasCoolDown:HasCoolDown,
    OverflowText:OverflowText,
    validateRequest:validateRequest,
    IsValidDomain:IsValidDomain,
    Timer:Timer,
    UpdateGuildOption:UpdateGuildOption
};
