const
    fs = require('fs'),
    fnc = require('./functions'),
    Flag = require('discord.js').Permissions.FLAGS,
    { RichEmbed } = require('discord.js');
    //music = require('./music');
let
    writeStream = {},
    music = null,
    API = null;
// We have to wait for global.MusSys has been defined this only takes a millisecond but because require order this happens after it has been defined
setTimeout(function () {
    music = global.MusSys;
    API = global.api;
}, 0.1);

function CheckFeatures(serverId, category, funCallback) {
    switch (category) {
        case 'music':
            global.conn.query(
                `SELECT value FROM core_settings WHERE guild_id = (SELECT guild_id FROM core_guilds WHERE serverId = '${serverId}') AND option_id = 1`,
                (error, results, fields) => {
                    if (results.length == 0) {
                        return funCallback(false);
                    }

                    return funCallback(results[0].value);
            });
            break;
        default:
            funCallback(false);
    }
}

function HandleCmd(cmd, msgObj, context, category) {
    const
        voicechannel = msgObj.member.voiceChannel,
        serverId = msgObj.guild.id;
    if (music.checkPermanentFailure(serverId, voicechannel)) {
        msgObj.channel.send('```Permanent music failure!\nAn attempt was made to fix the issue, try again and contact a developer if the problem persists...```\nDeveloper: '+ global.creator);
    }

    CheckFeatures(serverId, category, result => {
        const channel = music.bot.channels.get(result)
        if (channel == undefined || channel.id == msgObj.channel.id) {
            switch(cmd) {
                case 'ping':
                    const
                        ping = new Date().getTime() - msgObj.createdTimestamp,
                        botPing = Math.round(music.bot.ping);

                    msgObj.channel.send('`Pinging...`')
                    .then(msg => {
                        const embed = new RichEmbed()
                            .setTitle('Pong! 🏓')
                            .setDescription(`Ping to Discord: **${botPing}ms**\n\nResponse time: **${ping}ms**\n\nReply time: **${msg.createdTimestamp - msgObj.createdTimestamp}ms**`)
                            .setColor('#252422');
                        msg.edit(embed);
                    });

                    break;

                case 'play':
                    Play(msgObj, context);
                    break;

                case 'playlists':
                    Playlists(msgObj);
                    break;

                case 'playnext':
                    PlayNext(msgObj, context);
                    break;

                case 'repeat':
                    Repeat(msgObj);
                    break;

                case 'leave':
                    Leave(msgObj);
                    break;

                case 'lock':
                    Lock(msgObj, context);
                    break;

                case 'pause':
                    Pause(msgObj);
                    break;

                case 'queue':
                    Queue(msgObj, context);
                    break;

                case 'removelock':
                    RemoveLock(msgObj, context);
                    break;

                case 'resume':
                    Resume(msgObj);
                    break;

                case 'updateservers':
                    UpdateServers(msgObj);
                    break;

                case 'volume':
                    Volume(msgObj, context);
                    break;

                case 'skip':
                    SkipSong(msgObj);
                    break;

                case 'previous':
                    Previous(msgObj);
                    break;

                case 'invite':
                    Invite(msgObj);
                    break;

                case 'help':
                    Help(msgObj);
                    break;

                case 'stats':
                    Stats(msgObj);
                    break;

                case 'saveplaylist':
                    SavePlaylist(msgObj);
                    break;

                case 'record':
                    Record(msgObj);
                    break;

                case 'repeatplaylist':
                    RepeatPlaylist(msgObj);
                    break;

                case 'remove':
                    Remove(msgObj, context);
                    break;
            }
            return;
        }

        msgObj.reply(`you can't use commands from the ${category} category here, please use ${channel} text-channel for ${category} related commands.`)
        .then(msg => {
            msg.delete(5000);
        });
        msgObj.delete(1000);
    });
}

function Help(msgObj) {
    const embed = new RichEmbed()
        .setTitle('Need help?')
        .setDescription('Damon site with a list of commands: http://music.damon.sh/\nVisit me in my [Discord server](https://discord.gg/EG4zHFR)')
        .setColor('#32cd32')
        .setFooter('Powered by the 🔥 of the gods');

    msgObj.channel.send(embed);
}

function Invite(msgObj) {
    const embed = new RichEmbed()
        .setAuthor('Made by '+ global.creator.username, global.creator.avatarURL)
        .setDescription('Click [here](https://discordapp.com/oauth2/authorize?&client_id=544522054930792449&scope=bot&permissions=1278602576) to invite')
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

    if (music.isDamonInVC(voicechannel)) {
        return music.destroyQueue(msgObj.guild.id, () => {
            return voicechannel.leave();
        });
    }

    return msgObj.reply('you aren\'t in the bot its channel!');
}

function Lock(msgObj, context) {
    const
        serverId = msgObj.guild.id,
        serverMember = msgObj.member;

    if (!serverMember) {
        return;
    }

    if (serverMember.hasPermission(Flag.MANAGE_CHANNELS, false, true, true)) {
        const
            channel = msgObj.mentions.channels.first();
            type = context[0];

        if (type == 'music') {
            if (channel == undefined) {
                fnc.UpdateGuildOption(serverId, 'lockMusicChannel', '');
                return msgObj.reply('channel lock has been disabled!');
            }

            fnc.UpdateGuildOption(serverId, 'lockMusicChannel', channel.id);
        }
        else {
            return msgObj.reply(`unknown category "${type}", try again with a valid category.`);
        }

        msgObj.reply(`channel lock has been enabled for ${type} on channel ${channel}`);
    }
    else {
        msgObj.reply('you do not have permission to lock features to a specific channel.\nYou need the `MANAGE_CHANNELS` permission.')
    }
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
            if (!response) {
                return msgObj.reply('invalid url given!');
            }
            else if (response.list != undefined) {
                music.playlistEmbed(msgObj, voicechannel, response);
            }
            else {
                // Check if this server has a queue
                if (music.hasQueue(msgObj.guild.id)) {
                    if (music.isDamonInVC(voicechannel)) {
                        return music.addToQueue(msgObj.guild.id, response, msgObj.member.id, title => {
                            // return msgObj.channel.send({embed});
                            return msgObj.channel.send('Added song **'+ title +'**');
                        });
                    }

                    return msgObj.reply('you aren\'t in the bot its channel!');
                }
                // else create a queue and add the first request
                else {
                    music.createQueue(msgObj.guild.id, response, msgObj.channel.id, msgObj.member.id, title => {
                        music.startQueue(msgObj.guild.id, voicechannel, () => {
                            // return msgObj.channel.send({embed});
                             return msgObj.channel.send('Playback starting with **'+ title +'**');
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
            return API.searchYoutube(searchFor, result => {
                music.choiceEmbed(msgObj, voicechannel, result);
            });
        }

        return msgObj.reply('please give a valid url or a music title to search for.');
    }
}

function Playlists(msgObj) {
    
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
            if (!response) {
                return msgObj.reply('invalid url given!');
            }
            else {
                // Check if this server has a queue
                if (music.hasQueue(msgObj.guild.id)) {
                    if (music.isDamonInVC(voicechannel)) {
                        return music.playNextInQueue(msgObj.guild.id, response, msgObj.member.id, title => {
                            // return msgObj.channel.send({embed});
                            return msgObj.channel.send('Playing song **'+ title +'** next up');
                        });
                    }

                    return msgObj.reply('you aren\'t in the bot its channel!');
                }
                // else create a queue and add the first request
                else {
                    music.createQueue(msgObj.guild.id, response, msgObj.channel.id, msgObj.member.id, title => {
                        music.startQueue(msgObj.guild.id, voicechannel, () => {
                            // return msgObj.channel.send({embed});
                            return msgObj.channel.send('Playback starting with **'+ title +'**');
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
            return API.searchYoutube(searchFor, result => {
                music.choiceEmbed(msgObj, voicechannel, result, true);
            });
        }

        return msgObj.reply('please give a valid url or a music title to search for.');
    }
}

function Pause(msgObj) {
    const voicechannel = msgObj.member.voiceChannel;
    if (!voicechannel) {
        return msgObj.reply('you aren\'t in a channel!');
    }

    if (music.isDamonInVC(voicechannel)) {
        return music.pausePlayback(msgObj.guild.id, () => {
            return msgObj.reply('music has been paused.')
                .then(msg => {
                    msg.delete(2500);
                });
        });
    }

    return msgObj.reply('you aren\'t in the bot its channel!');
}

function Previous(msgObj) {
    const voicechannel = msgObj.member.voiceChannel;
    if (!voicechannel) {
        return msgObj.reply('you aren\'t in a channel!');
    }

    if (music.isDamonInVC(voicechannel)) {
        return music.playPrevious(msgObj.guild.id, voicechannel, bool => {
            if (!bool) {
                return msgObj.reply('no previous songs to be played!');
            }
        });
    }

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
        if (isNaN(context[0]) && !(context[0].includes(',') || context[0].includes('.')) && Number.isInteger(context[0])) {
            return msgObj.reply('invalid page number!');
        }

        if (context[0] < 0) {
            page = context[0];
        }
        else {
            page = (context[0] - 1);
        }

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
            if (
                music.servers[server.id].queue[i] != null
                || (music.servers[server.id].queue[music.config.maxprequeue] == null
                    && (music.servers[server.id].queue[music.config.maxprequeue - 1] != null || music.servers[server.id].queue[music.config.maxprequeue + 1] != null)
                )
            ) {
                queueObj = music.servers[server.id].queue[i];
                if (queueObj != null) {
                    songData = queueObj.songData;
                }

                if (i < music.config.maxprequeue) {
                    if (songData.videoData == undefined) {
                        continue;
                    }

                    if (embedDescr == '') {
                        embedDescr += '---------------- Previous ----------------';
                    }

                    embedDescr += '\n-'+ (music.config.maxprequeue-i) +': **' + songData.videoData.title + '** | Requested by: <@'+ queueObj.requester +'>';
                }
                else {
                    if (i == music.config.maxprequeue) {
                        embedDescr += '\n\n-------------- Now Playing ---------------';
                    }

                    if (i == (music.config.maxprequeue + 1) || embedDescr == '') {
                        embedDescr += '\n\n---------------- Next Up -----------------';
                    }

                    if (queueObj == null) {
                        embedDescr += '\n'+ (i-music.config.maxprequeue+1) +': **{ SONG HAS BEEN REMOVED }**';
                    }
                    else {
                        embedDescr += '\n'+ (i-music.config.maxprequeue+1) +': **' + songData.videoData.title + '** | Requested by: <@'+ queueObj.requester +'>';
                    }
                }

                if (i == (topLimit - 1) || i == (length - 2)) {
                    const embed = new RichEmbed()
                        .setAuthor('Queue for ' + server.name, server.iconURL)
                        .setColor('#252422')
                        .setDescription(embedDescr)
                        .setFooter('You can use !q <number> to see more of the queue');

                    return msgObj.channel.send(embed);
                }
            }
        }
        const embed = new RichEmbed()
            .setAuthor('Queue for ' + server.name, server.iconURL)
            .setColor('#252422')
            .setDescription('This page is empty.')
            .setFooter('You can use !q <number> to see more of the queue');

        return msgObj.channel.send(embed);
    }

    return msgObj.channel.send('No music is playing currently.');
}

function Record(msgObj) {
    const voicechannel = msgObj.member.voiceChannel;
    // Check if user that does the request is in a voicechannel
    if (!voicechannel) {
        return msgObj.reply('you aren\'t in a channel!');
    }

    return voicechannel.join(conn => {
        const receiver = conn.createReceiver();

        conn.on('speaking', (user, speaking) => {
            if (speaking) {

            }
        });
    });

    if (!music.isDamonInVC(voicechannel)) {
        // lul
    }

    return msgObj.reply('you aren\'t in the bot its channel.');
}

function RecordStop(msgObj) {
    writeStream[msgObj.guild.id].end();
    msgObj.channel.send('Recording stopped!');
}

function Remove(msgObj, context) {
    const
        voicechannel = msgObj.member.voiceChannel,
        serverId = msgObj.guild.id;
    if (!voicechannel) {
        return msgObj.reply('you aren\'t in a channel!');
    }

    if (music.isDamonInVC(voicechannel)) {
        if (context[0] != '') {
            if (music.removeSong(serverId, context[0])) {
                return msgObj.reply(' the selected song has been removed.');
            }

            return msgObj.reply(' invalid song number. \nThe number of the song has to exist in queue, check queue with !q <# page number>.');
        }
        else {
            if (music.removeSong(serverId, null)) {
                return msgObj.reply(' currently playing song has been removed and will no longer be in queue.');
            }

            return msgObj.reply(' failed to remove song.');
        }
    }

    return msgObj.reply('you aren\'t in the bot its channel!');
}

function Repeat(msgObj) {
    const voicechannel = msgObj.member.voiceChannel;
    if (!voicechannel) {
        return msgObj.reply('you aren\'t in a channel!');
    }
    if (music.isDamonInVC(voicechannel)) {
        return music.repeat(msgObj.guild.id, bool => {
            if (bool) {
                return msgObj.channel.send('Repeat **ON**.');
            }

            return msgObj.channel.send('Repeat **OFF**.');
        });
    }

    return msgObj.reply('you aren\'t in the bot its channel!');
}

function RepeatPlaylist(msgObj) {
    const voicechannel = msgObj.member.voiceChannel;
    if (!voicechannel) {
        return msgObj.reply('you aren\'t in a channel!');
    }

    if (music.isDamonInVC(voicechannel)) {
        return music.repeatQueueToggle(msgObj.guild.id, bool => {
            if (bool) {
                return msgObj.channel.send('Playlist repeat **ON**.');
            }

            return msgObj.channel.send('Playlist repeat **OFF**.');
        });
    }

    return msgObj.reply('you aren\'t in the bot its channel!');
}

function RemoveLock(msgObj, context) {
    const
        serverId = msgObj.guild.id,
        serverMember = msgObj.member;

    if (!serverMember) {
        return;
    }

    if (serverMember.hasPermission(Flag.MANAGE_CHANNELS, false, true, true)) {
        const type = context[0];

        if (type == 'music') {
            fnc.UpdateGuildOption(serverId, 'lockMusicChannel', '');
            return msgObj.reply('channel lock has been disabled!');
        }

        return msgObj.reply(`unknown category "${type}", try again with a valid category.`);
    }
    else {
        msgObj.reply('you do not have permission to lock features to a specific channel.\nYou need the `MANAGE_CHANNELS` permission.')
    }
}

function Resume(msgObj) {
    const voicechannel = msgObj.member.voiceChannel;
    if (!voicechannel) {
        return msgObj.reply('you aren\'t in a channel!');
    }

    if (music.isDamonInVC(voicechannel)) {
        return music.resumePlayback(msgObj.guild.id, () => {
            return msgObj.reply('music has been resumed.')
                .then(msg => {
                    msg.delete(2500);
                });
        });
    }

    return msgObj.reply('you aren\'t in the bot its channel!');
}

function SkipSong(msgObj) {
    const voicechannel = msgObj.member.voiceChannel;
    if (!voicechannel) {
        return msgObj.reply('you aren\'t in a channel!');
    }

    if (music.isDamonInVC(voicechannel)) {
        return music.playNext(msgObj.guild.id, voicechannel);
    }

    return msg.reply('you aren\'t in the bot its channel!');
}

function SavePlaylist(msgObj) {
    const voicechannel = msgObj.member.voiceChannel;
    // Check if user that does the request is in a voicechannel
    if (!voicechannel) {
        return msgObj.reply('you aren\'t in a voicechannel!');
    }

    if (music.servers[msgObj.guild.id] == undefined || music.servers[msgObj.guild.id].queue == undefined) {
        return msgObj.reply('there\'s no active queue in your server to save.');
    }

    const
        userId = msgObj.author.id,
        queue = music.servers[msgObj.guild.id].queue;

    fnc.UserExist(userId, internal_id => {
        fnc.HasCoolDown(msgObj.author, 'savePlaylist', 60*60*24, bool => {
            if (bool) {
                return msgObj.reply('command \"saveplaylist\" is still on cooldown, this command has a cooldown of 1 day!')
                    .then(msg => {
                        msg.delete(3*1000);
                    });
            }

            fnc.CreateNewPlaylist(internal_id, playlist_id => {
                for (let i = 0; i < queue.length; i++) {
                    const songObj = queue[i];

                    if (songObj == null) {
                        continue;
                    }

                    fnc.SongExists(songObj, song_id => {
                        fnc.AddSongToPlaylist(playlist_id, song_id);
                    });
                }

                msgObj.reply('current queue has been saved, share your playlist with `' + fnc.GetAlphaValue(playlist_id) + '`.\nView your saved playlists with `!playlists`');
            });
        });
    }, true);
}

function Stats(msgObj) {
    const
        stats = music.getStats(),
        embed = new RichEmbed()
            .setTitle('Current stats')
            .setDescription('Servers: **'+ stats.serverCount +'**\nUsers: **'+ stats.userCount +'**\n\nPlaying music in **'+ stats.serverPlayingCount +'** servers\nwith **'+ stats.songCount +'** songs in queue!\n\u200B')
            .setColor('#32cd32')
            .setFooter('Powered by the 🔥 of the gods');

    msgObj.channel.send(embed);
}

function UpdateServers(msgObj) {
    const servers = music.bot.guilds;

    if (msgObj.member.id != '243072972326305798') {
        return msgObj.reply('you do not have permission to use this command.');
    }

    for (server of servers) {
        fnc.AddGuildToDB(server[1]);
    }
    msgObj.reply('updated servers in DB.');
}

function Volume(msgObj, context) {
    const
        voicechannel = msgObj.member.voiceChannel,
        serverId = msgObj.guild.id;

    if (!voicechannel) {
        return msgObj.reply('you aren\'t in a channel!');
    }

    if (music.isDamonInVC(voicechannel)) {
        if (context[0] == '') {
            return msgObj.reply('the current volume is '+ (music.currentVolume(serverId) * 100));
        }
        else {
            if (!context[0].includes(',') && !isNaN(context[0]) && parseInt(context[0], 10) <= 200 && parseInt(context[0], 10) >= 0) {
            //if (!context[0].includes(',') && !isNaN(context[0]) && parseInt(context[0], 10) >= 0) {
                return music.setVolume(serverId, context[0]);
            }

            return msgObj.reply('invalid volume, please give a value between 0 and 200');
        }
    }

    return msgObj.reply('you aren\'t in the bot its channel!');
}

module.exports = {
    HandleCmd: HandleCmd
};
