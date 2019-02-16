const
    fs = require('fs'),
    url = require('url'),
    mysql = require('mysql'),
    queryString = require('query-string'),
    validUrl = require('valid-url'),
    config = JSON.parse(fs.readFileSync(global.PATH +'/data/config.json'));

let
    API = null;

setTimeout(function () {
    API = global.api;
}, 1);

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
    if (validUrl.isWebUri(domain))
        return true;
    return false;
}

function OverflowText(text, maxChars, delimiter='...') {
    if (text.length > maxChars) {
        text = text.substring(0, maxChars - 3) + '...';
    }
    return text;
}

async function validateRequest(song, callback) {
    let
        videoId = '',
        parsedUrl = url.parse(song),
        domain = parsedUrl.hostname;

    if (domain.includes('youtube') || domain.includes('youtu.be')) {
        if (domain == 'youtu.be')
            videoId = parsedUrl.pathname.split('/')[1];
        else
            videoId = queryString.parse(parsedUrl.search).v;

        if (videoId != undefined)
            return callback({source: 'yt', id: videoId});
    }

    if (domain.includes('soundcloud.com')) {
        api.resolveSoundCloud(song, (res) => {
            if (res.kind != 'track')
                return callback(false);
            return callback({source: 'sc', id: res.id});
        });
    }
    else
        return false;
}


/*
 *  User related functions
 */
function CreateUser(userId) {
    RunSQL('INSERT INTO users (discord_id) VALUES ("'+ userId +'")');
}

function HasCoolDown(userObj, cmd, time, funCallback) {
    const userId = userObj.id;
    UserExist(userId, result => {
        if (result == false) return funCallback(result);
        RunSQL('SELECT * FROM cooldowns WHERE uid = '+ result.uid +' AND command_id = (SELECT command_id FROM commands WHERE command = "'+ cmd +'") ORDER BY timestamp DESC LIMIT 1', cooldownResult => {
            if (cooldownResult.length > 0) {
                const date = (new Date() - (time * 1000));
                if (new Date(cooldownResult[0].timestamp).getTime() <= new Date(date).getTime()) {
                    RunSQL('INSERT INTO cooldowns (command_id, uid) VALUES ((SELECT command_id FROM commands WHERE command = "'+ cmd +'"), '+ result.uid +')');
                    return funCallback(false);
                }
                return funCallback(true);
            }
            RunSQL('INSERT INTO cooldowns (command_id, uid) VALUES ((SELECT command_id FROM commands WHERE command = "'+ cmd +'"), '+ result.uid +')');
            return funCallback(false);
        });
    });
}

function RunSQL(sql, funCallback=null) {
    global.conn.query(sql, (err, result) => {
        if (err) throw sql +'\n'+ err;
        if (funCallback!=null)
            funCallback(result);
    });
}

function UserExist(userId, funCallback) {
    RunSQL('SELECT uid FROM users WHERE discord_id = "'+ userId +'"', result => {
        if (result.length > 0)
            return funCallback(result[0]);
        CreateUser(userId);
        return funCallback(false);
    });
}

module.exports = {
    GetThumbnail:GetHighestQualityThumbnail,
    HasCoolDown:HasCoolDown,
    OverflowText:OverflowText,
    validateRequest:validateRequest,
    IsValidDomain:IsValidDomain
};
