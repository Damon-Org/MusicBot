const
    fnc = require('./functions'),
    { RichEmbed } = require('discord.js');
    //music = require('./music');
let
    music = null,
    API = null;
// We have to wait for global.MusSys has been defined this only takes a millisecond but because require order this happens after it has been defined
setTimeout(function () {
    music = global.MusSys;
    API = global.api;
}, 1);

function HandleCmd(cmd, msgObj, context) {
    if (cmd == 'ping') {
        const ping = new Date().getTime() - msgObj.createdTimestamp;
        msgObj.channel.send('`Pinging...`')
        .then(msg => {
            const embed = new RichEmbed()
                .setTitle('Pong! 🏓')
                .setDescription(`Response time: **${ping}ms**\n\nReply time: **${msg.createdTimestamp - msgObj.createdTimestamp}ms**`)
                .setColor('#252422');
            msg.edit(embed);
        });
    }

    if (cmd == 'play')
        Play(msgObj, context);

    if (cmd == 'playnext')
        PlayNext(msgObj, context);

    if (cmd == 'repeat')
        Repeat(msgObj);

    if (cmd == 'leave')
        Leave(msgObj);

    if (cmd == 'pause')
        Pause(msgObj);

    if (cmd == 'queue')
        Queue(msgObj, context);

    if (cmd == 'resume')
        Resume(msgObj);

    if (cmd == 'volume')
        Volume(msgObj, context);

    if (cmd == 'skip')
        SkipSong(msgObj);

    if (cmd == 'previous')
        Previous(msgObj);

    if (cmd == 'invite')
        Invite(msgObj);
}

function Invite(msgObj) {
    const embed = new RichEmbed()
        .setAuthor('Made by '+ global.creator.username, global.creator.avatarURL)
        .setDescription('Click [here](https://discordapp.com/oauth2/authorize?&client_id=544522054930792449&scope=bot&permissions=36826192) to invite')
        .setColor('#dd0a35')
        .setImage()
        .setFooter('Powered by the 🔥 of the gods');
    msgObj.channel.send(embed);
}

function Leave(msgObj) {
    const voicechannel = msgObj.member.voiceChannel;
    if (!voicechannel) {
        return msg.reply('you aren\'t in a channel!');
    }
    if (music.isDragonInVC(voicechannel)) {
        music.destroyQueue(msgObj.guild.id, () => {
            return voicechannel.leave();
        });
    }
    else
        return msgObj.reply('you aren\'t in the bot its channel!');
}

function Play(msgObj, context) {
    const voicechannel = msgObj.member.voiceChannel;
    // Check if user that does the request is in a voicechannel
    if (!voicechannel) {
        return msgObj.reply('you aren\'t in a channel!');
    }
    // Check if the parameter given is a valid url
    if (fnc.IsValidDomain(context[0])) {
        let song = context[0];
        // Validate the request if the domain is a supported one
        if (!fnc.validateRequest(song, response => {
            // Invalid domain reply to requester
            if (!response) return msgObj.reply('invalid url given!');
            else {
                // Check if this server has a queue
                if (music.serverExistsInQueue(msgObj.guild.id)) {
                    if (music.isDragonInVC(voicechannel))
                        music.addToQueue(msgObj.guild.id, response, msgObj.member.id, embed => {
                            // return msgObj.channel.send({embed});
                             return msgObj.channel.send('Song has been added');
                        });
                    else
                        return msgObj.reply('you aren\'t in the bot its channel!');
                }
                // else create a queue and add the first request
                else {
                    music.createQueue(msgObj.guild.id, response, msgObj.channel.id, msgObj.member.id, embed => {
                        music.startQueue(msgObj.guild.id, voicechannel, () => {
                            // return msgObj.channel.send({embed});
                             return msgObj.channel.send('Playback starting');
                        });
                    });
                }
            }
        })) {
            // Invalid Youtube url
            return msgObj.reply('broken or unsupported link!');
        }
    }
    // Otherwise try a search on it on youtube
    else {
        const searchFor = context.join(' ');
        if (searchFor.length > 0) {
            API.searchYoutube(searchFor, result => {
                music.choiceEmbed(msgObj, voicechannel, result);
            });
        }
        else {
            return msgObj.reply('please give a valid url or a music title to search for.');
        }
    }
}

function PlayNext(msgObj, context) {
    const voicechannel = msgObj.member.voiceChannel;
    if (!voicechannel) {
        return msgObj.reply('you aren\'t in a channel!');
    }
    // Check if the parameter given is a valid url
    if (fnc.IsValidDomain(context[0])) {
        let song = context[0];
        // Validate the request if the domain is a supported one
        if (!fnc.validateRequest(song, response => {
            // Invalid domain reply to requester
            if (!response) return msgObj.reply('invalid url given!');
            else {
                // Check if this server has a queue
                if (music.serverExistsInQueue(msgObj.guild.id)) {
                    if (music.isDragonInVC(voicechannel))
                        music.playNextInQueue(msgObj.guild.id, response, msgObj.member.id, embed => {
                            // return msgObj.channel.send({embed});
                            return msgObj.channel.send('Playing song next up');
                        });
                    else
                        return msgObj.reply('you aren\'t in the bot its channel!');
                }
                // else create a queue and add the first request
                else {
                    music.createQueue(msgObj.guild.id, response, msgObj.channel.id, msgObj.member.id, embed => {
                        music.startQueue(msgObj.guild.id, voicechannel, () => {
                            // return msgObj.channel.send({embed});
                            return msgObj.channel.send('Playback starting');
                        });
                    });
                }
            }
        })) {
            // Invalid Youtube url
            return msgObj.reply('broken link or unsupported link!');
        }
    }
    // Otherwise try a search on it on youtube
    else {
        const searchFor = context.join(' ');
        if (searchFor.length > 0) {
            API.searchYoutube(searchFor, result => {
                music.choiceEmbed(msgObj, voicechannel, result, true);
            });
        }
        else {
            return msgObj.reply('please give a valid url or a music title to search for.');
        }
    }
}

function Pause(msgObj) {
    const voicechannel = msgObj.member.voiceChannel;
    if (!voicechannel) {
        return msgObj.reply('you aren\'t in a channel!');
    }
    if (music.isDragonInVC(voicechannel)) {
        music.pausePlayback(msgObj.guild.id, () => {
            return msgObj.reply('music has been paused.');
        });
    }
    else
        return msgObj.reply('you aren\'t in the bot its channel!');
}

function Previous(msgObj) {
    const voicechannel = msgObj.member.voiceChannel;
    if (!voicechannel) {
        return msgObj.reply('you aren\'t in a channel!');
    }
    if (music.isDragonInVC(voicechannel)) {
        music.playPrevious(msgObj.guild.id, voicechannel, bool => {
            if (!bool)
                return msgObj.reply('no previous songs to be played!');
        });
    }
    else
        return msgObj.reply('you aren\'t in the bot its channel!');
}

function Queue(msgObj, context) {
    const
        server = msgObj.guild;
    let
        bottomLimit = 0,
        topLimit = 0,
        page = 0;

    if (context[0] != '') {
        if (isNaN(context[0]) && !(context[0].includes(',') || context[0].includes('.')) && Number.isInteger(context[0]))
            return msgObj.reply('invalid page number!');
        if (context[0] < 0)
            page = context[0];
        else
            page = (context[0] - 1);

        bottomLimit = music.config.maxprequeue + (music.config.pagesize * page) - (music.config.pagesize / 2),
        topLimit = music.config.maxprequeue + (music.config.pagesize * page) + (music.config.pagesize / 2);
    }
    else {
        bottomLimit = music.config.maxprequeue + (music.config.pagesize * page) - (music.config.pagesize / 2),
        topLimit = music.config.maxprequeue + (music.config.pagesize * page) + (music.config.pagesize / 2);
    }

    if (music.hasQueue(server.id)) {
        const length = music.servers[server.id].queue.length;
        let
            embedDescr = '',
            songData = {},
            queueObj = {};
        for (let i = bottomLimit; i < topLimit; i++) {
            if (music.servers[server.id].queue[i] != null) {
                queueObj = music.servers[server.id].queue[i];
                songData = queueObj.songData;

                if (i < music.config.maxprequeue) {
                    if (embedDescr == '')
                        embedDescr += "---------------- Previous ----------------";
                    embedDescr += '\n-'+ (music.config.maxprequeue-i) +': **' + songData.videoData.title + '** | Requested by: <@'+ queueObj.requester +'>';
                }
                else {
                    if (i == music.config.maxprequeue)
                        embedDescr += "\n\n-------------- Now Playing ---------------";
                    if (i == (music.config.maxprequeue + 1) || embedDescr == '')
                        embedDescr += "\n\n---------------- Next Up -----------------";
                    embedDescr += '\n'+ (i-music.config.maxprequeue+1) +': **' + songData.videoData.title + '** | Requested by: <@'+ queueObj.requester +'>';
                }

                if (i == (topLimit - 1) || i == (length - 2)) {
                    const embed = new RichEmbed()
                        .setAuthor('Queue for ' + server.name, server.iconURL)
                        .setColor('#252422')
                        .setDescription(embedDescr)
                        .setFooter('You can use !q <number> to see more of the queue');

                    msgObj.channel.send(embed);
                    break;
                }
            }
        }
    }
    else {
        msgObj.channel.send("No music is playing currently.");
    }
}

function Repeat(msgObj) {
    const voicechannel = msgObj.member.voiceChannel;
    if (!voicechannel) {
        return msgObj.reply('you aren\'t in a channel!');
    }
    if (music.isDragonInVC(voicechannel)) {
        music.repeat(msgObj.guild.id, bool => {
            if (bool)
                return msgObj.channel.send('Repeat **ON**.')
            else
                return msgObj.channel.send('Repeat **OFF**.')
        });
    }
    else
        return msgObj.reply('you aren\'t in the bot its channel!');
}

function Resume(msgObj) {
    const voicechannel = msgObj.member.voiceChannel;
    if (!voicechannel) {
        return msgObj.reply('you aren\'t in a channel!');
    }
    if (music.isDragonInVC(voicechannel)) {
        music.resumePlayback(msgObj.guild.id, () => {
            return msgObj.reply('music has been resumed.');
        });
    }
    else
        return msgObj.reply('you aren\'t in the bot its channel!');
}

function SkipSong(msgObj) {
    const voicechannel = msgObj.member.voiceChannel;
    if (!voicechannel)
        return msgObj.reply('you aren\'t in a channel!');
    if (music.isDragonInVC(voicechannel)) {
        return music.playNext(msgObj.guild.id, voicechannel);
    }
    return msg.reply('you aren\'t in the bot its channel!');
}

function Volume(msgObj, context) {
    const voicechannel = msgObj.member.voiceChannel;
    if (!voicechannel)
        return msgObj.reply('you aren\'t in a channel!');
    if (music.isDragonInVC(voicechannel)) {
        if (!context[0].includes(',') && !isNaN(context[0]) && parseInt(context[0], 10) <= 200 && parseInt(context[0], 10) >= 0)
            return music.setVolume(msgObj.guild.id, context[0]);
        else
            return msgObj.reply('invalid volume, please give a value between 0 and 200');
    }
    return msgObj.reply('you aren\'t in the bot its channel!');
}

module.exports = {
    HandleCmd: HandleCmd
};
