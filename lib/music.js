const
    { GetThumbnail, OverflowText, Timer } = require('./functions'),
    opus = require('node-opus'),
    ytdl = require('ytdl-core'),
    { RichEmbed, DiscordAPIError } = require('discord.js');

let
    API = null;

setTimeout(function () {
    API = global.api;
}, 1);

class MusicSystem {
    constructor(config, bot) {
        this.config = config;
        this.bot = bot;

        this.servers = {};

        console.log('Music System Started!');
    }

    addToQueue(serverId, reqResponse, userId, funCallback) {
        const
            length = this.servers[serverId].queue.length;

        this.getSongData(reqResponse, data => {
            this.servers[serverId].queue[length - 1] = Object.assign(reqResponse, {repeat: 0, requester: userId, songData: data, length: data.length});
            // Set last in array to null to mark the end of queue
            this.servers[serverId].queue[length] = null;

            return funCallback(data.videoData.title);
        });
        return ;
    }

    choiceEmbed(msgObj, voicechannel, search, exception=false) {
        const
            serverId = msgObj.guild.id,
            userId = msgObj.author.id;
        let
            embedDescr = 'Songs: ',
            songs = [];

        if (!this.servers[serverId]) {
            this.servers[serverId];
            this.servers[serverId] = {choiceObj: {}};
        }
        else if (!this.servers[serverId].choiceObj) {
            this.servers[serverId] = Object.assign(this.servers[serverId], {choiceObj: {}});
        }

        for (var i = 0; i < search.length; i++) {
            songs[i] = {
                id: search[i].id.videoId,
                source: 'yt'
            };

            embedDescr += '\n#'+ (i+1) +': **' + search[i].snippet.title +'**';
        }

        let
            embed = new RichEmbed(),
            fail = false;
        if (songs.length == 0) {
            embed.setTitle('I could not find the song you requested')
                .setDescription('Forgive me father for I have sinned 😔\nI could not find the song thy asked for...')
                .setColor('#ed4337');

            fail = true;
        }
        else {
            embed.setTitle('Choose a song:')
                .setColor('#252422')
                .setDescription(embedDescr)
                .setFooter('You can select a song by pressing the buttons below...');
        }


        this.servers[serverId].choiceObj[userId];

        msgObj.channel.send(embed)
        .then(msg => {
            this.servers[serverId].choiceObj[userId] = {
                choices: songs,
                msgObj: msg,
                voicechannel: voicechannel,
                exception: exception
            };

            if (!fail) {
                this.choiceEmbedListener(msg);
            }
        });
    }

    checkPermanentFailure(serverId, voicechannel) {
        if (!this.isDamonInVC(voicechannel) && this.servers[serverId] != undefined && this.servers[serverId].queue.length > 0) {
            this.destroyQueueDidNotStart(serverId);
            return true;
        }

        return false;
    }


    choiceEmbedListener(msgObj) {
        // const emojis = ['\u0030\u20E3','\u0031\u20E3','\u0032\u20E3','\u0033\u20E3','\u0034\u20E3','\u0035\u20E3', '\u0036\u20E3','\u0037\u20E3','\u0038\u20E3','\u0039\u20E3'];
        const emojis = ['\u0031\u20E3','\u0032\u20E3','\u0033\u20E3','\u0034\u20E3','\u0035\u20E3', '🚫'];

        react();
        function react(i=0) {
            if (i < emojis.length) {
                try {
                    msgObj.react(emojis[i])
                    .then(() => {
                        react(i+1);
                    }).catch(e => {});
                } catch (e) {}
            }
        }
    }

    continueQueue(serverId, voicechannel) {
        this.playSound(serverId, voicechannel);
    }

    createQueue(serverId, reqResponse, channel, userId, funCallback) {
        if (!this.servers[serverId]) {
            this.servers[serverId];
            this.servers[serverId] = {queue: [], volume: 0.15, playing: false, recording: false, repeat: 0, timer: null, stream: null, paused: false, channel: channel, msgObj: null};
        }
        else {
            this.servers[serverId] = Object.assign(this.servers[serverId], {queue: [], volume: 0.15, playing: false, recording: false, repeat: 0, timer: null, stream: null, paused: false, channel: channel, msgObj: null});
        }

        for (var i = 0; i < this.config.maxprequeue; i++) {
            this.servers[serverId].queue[i] = null;
        }

        this.getSongData(reqResponse, data => {
            this.servers[serverId].queue[i] = Object.assign(reqResponse, {repeat: 0, requester: userId, songData: data, length: data.length});
            // By assigning the last in the queue to be null we know this is the end of our queue
            this.servers[serverId].queue[i+1] = null;

            return funCallback(data.videoData.title);
        });

        return;
    }

    createStreamCountdown(serverId) {
        const songLength = this.servers[serverId].queue[this.config.maxprequeue].length;

        this.servers[serverId].playing = true;
        this.servers[serverId].timer = new Timer(() => {
            this.servers[serverId].playing = false;
            this.servers[serverId].stream.end('Song has ended');
        }, songLength * 1000 + 1000);
    }

    currentVolume(serverId) {
        return this.servers[serverId].volume;
    }

    destroyQueue(serverId, funCallback) {
        this.disableMusicEmbed(serverId, () => {
            this.servers[serverId].stream.end('lastSongAlreadyDisabled');
            if (this.servers[serverId].timer != null) {
                this.servers[serverId].timer.destroy();
            }

            this.servers[serverId].msgObj.member.setNickname(this.bot.user.username);
            this.servers[serverId] = undefined;

            return funCallback();
        });
    }

    destroyQueueDidNotStart(serverId) {
        this.servers[serverId].queue = undefined;
    }

    disableMusicEmbed(serverId, funCallback=null) {
        if (this.servers[serverId] != undefined) {
            const
                msgObj = this.servers[serverId].msgObj;

            if (msgObj == null) {
                if (funCallback != null) {
                    return funCallback();
                }

                return;
            }

            const
                embed = msgObj.embeds[0],
                author = embed.author,
                title = embed.title,
                description = embed.description,
                footer = embed.footer,
                disableEmbed = new RichEmbed()
                    .setAuthor(author.name, author.iconURL, author.url)
                    .setTitle(title)
                    .setColor('#4f545c')
                    .setDescription(description)
                    .setFooter(footer.text);

            if (embed.thumbnail != null) {
                disableEmbed.setThumbnail(embed.thumbnail.url);
            }

            msgObj.edit(disableEmbed);

            msgObj.clearReactions()
            .catch(err => {
                const
                    msgChannel = this.bot.channels.get(this.servers[serverId].channel),
                    embed = new RichEmbed()
                        .setColor('#ff0033')
                        .setDescription('The following error was generated while trying to remove reactions: \n```'+ err.toString() +'```');
                msgChannel.send(embed);
            });
        }

        if (funCallback != null) {
            funCallback();
        }
    }

    editEmbed(serverId, editObj, funCallback=null) {
        if (this.servers[serverId] != undefined) {
            const
                msgObj = this.servers[serverId].msgObj;

            if (msgObj == null) {
                if (funCallback != null) {
                    return funCallback();
                }

                return;
            }

            let
                embed = msgObj.embeds[0],
                author = embed.author,
                title = embed.title,
                description = embed.description,
                color = embed.hexColor,
                footer = embed.footer;

            editObj.author ? (author = editObj.author) : null;
            editObj.title ? (title = editObj.title) : null;
            editObj.description ? (description = editObj.description) : null;
            editObj.footer ? (footer = editObj.footer) : null;
            editObj.color ? (color = editObj.color) : null;

            let editEmbed = new RichEmbed()
                    .setAuthor(author.name, author.iconURL, author.url)
                    .setTitle(title)
                    .setColor(color)
                    .setDescription(description)
                    .setFooter(footer.text);

            if (embed.thumbnail != null && editObj.thumbnail == undefined) {
                editEmbed.setThumbnail(embed.thumbnail.url);
            } else if (editObj.thumbnail != undefined) {
                editEmbed.setThumbnail(editObj.thumbnail);
            }

            msgObj.edit(editEmbed);
        }

        if (funCallback != null) {
            funCallback();
        }
    }

    getSongData(songObj, funCallback=null) {
        if (songObj.source == 'yt') {
            ytdl.getInfo('https://youtu.be/'+ songObj.id)
            .then(data => {
                const
                    videoData = data.player_response.videoDetails,
                    author = data.author,
                    thumbnail = GetThumbnail(videoData.thumbnail.thumbnails),
                    returnData = {
                        videoData: videoData,
                        author: author,
                        thumbnail: thumbnail,
                        length: data.player_response.videoDetails.lengthSeconds,
                        id: songObj.id
                    };

                funCallback(returnData);
            });
        }

        if (songObj.source == 'sc') {
            API.getSoundCloudTrackData(songObj.id, (data) => {
                const
                    author = {
                        name: data.user.username,
                        url: data.user.permalink_url,
                        avatar: data.user.avatar_url
                    },
                    viewCount = data.playback_count,
                    title = data.title,
                    thumbnail = data.artwork_url,
                    returnData = {
                        author: author,
                        thumbnail: thumbnail,
                        id: songObj.id,
                        videoData: {
                            viewCount: viewCount,
                            title: title
                        }
                    }

                funCallback(returnData);
            });
        }
    }

    getStats() {
        let
            length = Object.keys(this.servers).length,
            songCount = 0;

        for (let vari in this.servers) {
            if (this.servers.hasOwnProperty(vari)) {
                for (var i = 0; i < this.servers[vari].queue.length; i++) {
                    if (this.servers[vari].queue[i] != null) {
                        songCount++;
                    }
                }
            }
        }

        const returnData = {
            serverPlayingCount: length,
            songCount: songCount,
            serverCount: global.stats.serverCount,
            userCount: global.stats.userCount
        }

        return returnData;
    }

    getStream(songObj) {
        switch(songObj.source) {
            case 'yt':
                return ytdl('https://youtu.be/' + songObj.id, {quality: 'highestaudio', highWaterMark: 1024 * 1024 * 10});
            case 'sc':
                return API.getSoundCloudStream(songObj.id);
        }
    }

    hasQueue(serverId) {
        if (this.servers[serverId] != undefined && this.servers[serverId].queue != undefined) {
            return true;
        }

        return false;
    }

    isDamonInVC(voicechannel) {
        if (voicechannel.members.get(this.bot.user.id)) {
            return true;
        }

        return false;
    }

    musicEmbed(serverObj) {
        const
            msgChannel = this.bot.channels.get(serverObj.channel),
            songObj = serverObj.queue[this.config.maxprequeue],
            data = songObj.songData;

        let embed = new RichEmbed();

        switch(songObj.source) {
            case 'yt':
                embed
                .setAuthor(data.author.name, data.author.avatar, data.author.channel_url)
                .setTitle(OverflowText(data.videoData.title, 60))
                .setColor('#32cd32')
                //.setThumbnail(data.thumbnail)
                .setThumbnail('https://damon.ilysi.com/_users/yimura/home/play_inverted.png')
                .setDescription('\nRequested by: **'+ this.bot.users.get(serverObj.queue[this.config.maxprequeue].requester) + '**')
                .setFooter('👀 '+ data.videoData.viewCount);

                break;
            case 'sc':
                embed
                .setAuthor(data.author.name, data.author.avatar, data.author.url)
                .setTitle(OverflowText(data.videoData.title, 60))
                .setColor('#32cd32')
                .setThumbnail('https://damon.ilysi.com/_users/yimura/home/play_inverted.png')
                .setDescription('\nRequested by: **'+ this.bot.users.get(serverObj.queue[this.config.maxprequeue].requester) + '**')
                .setFooter('👀 '+ data.videoData.viewCount);

                if (data.thumbnail != null) {
                    embed.setThumbnail(data.thumbnail);
                }

                break;
        }

        msgChannel.send({embed})
        .then(msgObj => {
            serverObj.msgObj = msgObj;

            this.musicEmbedListener(msgObj);
        });
    }

    musicEmbedListener(msgObj) {
        const emojis = ['⏮', '⏸', '⏭', '🔁'];

        react();
        function react(i=0) {
            if (i < emojis.length) {
                msgObj.react(emojis[i])
                .then(() => {
                    react(i+1);
                });
            }
        }
    }

    pausePlayback(serverId, funCallback=null) {
        if (!this.servers[serverId].paused) {
            this.servers[serverId].stream.pause();
            this.servers[serverId].timer.pause();
            this.servers[serverId].paused = true;

            this.editEmbed(serverId, { footer: 'SONG PAUSED', color: '#dd0a35', thumbnail: 'https://damon.ilysi.com/_users/yimura/home/paused.png'})

            this.servers[serverId].msgObj.member.setNickname(this.bot.user.username + ' (Paused)');

            if (funCallback != null) {
                return funCallback(true);
            }
        }
    }

    pauseToggle(serverId) {
        const paused = this.servers[serverId].paused;

        if (paused == true) {
            return this.resumePlayback(serverId);
        }

        return this.pausePlayback(serverId);
    }

    playSound(serverId, voicechannel) {
        if (!this.servers[serverId].player && this.servers[serverId] != undefined) {
            let queue = this.servers[serverId].queue;

            if (voicechannel.full) {
                this.destroyQueueDidNotStart(serverId);

                const
                    msgChannel = this.bot.channels.get(this.servers[serverId].channel),
                    embed = new RichEmbed()
                        .setTitle('Error 502')
                        .setColor('#ff0033')
                        .setDescription('Your voicechannel appears to be full, so I can\'t join 😢');

                return msgChannel.send(embed);
            }

            if (!voicechannel.joinable) {
                this.destroyQueueDidNotStart(serverId);

                const
                    msgChannel = this.bot.channels.get(this.servers[serverId].channel),
                    embed = new RichEmbed()
                        .setTitle('Error 403')
                        .setColor('#ff0033')
                        .setDescription('I don\'t have permission to join your voicechannel.');

                return msgChannel.send(embed);
            }

            voicechannel.join().then(conn => {
                if (this.servers[serverId] == undefined) {
                    return;
                }

                const musicStream = this.getStream(this.servers[serverId].queue[this.config.maxprequeue]);
                const audioStream = conn.playStream(musicStream);

                this.createStreamCountdown(serverId);

                this.musicEmbed(this.servers[serverId]);

                // Set our player and datastream
                this.servers[serverId].player = true;
                this.servers[serverId].stream = audioStream;

                audioStream.setVolume(this.servers[serverId].volume);

                audioStream.on('end', end => {
                    if (!this.servers[serverId].playing) {
                        console.log('End of song detected');
                        console.log(end);

                        if (this.servers[serverId].player) {
                            return this.playNext(serverId, voicechannel);
                        }

                        return;
                    }
                    return console.log('Tried to play song even tho song is playing...');
                });
            }).catch(err => {
                const
                    msgChannel = this.bot.channels.get(this.servers[serverId].channel),
                    embed = new RichEmbed()
                        .setColor('#ff0033')
                        .setDescription('The following error was generated while trying to play music: \n```'+ err.toString() +'```');

                msgChannel.send(embed);

                console.log(err);
            });
        }
    }

    playNext(serverId, voicechannel, exception=false) {
        if (this.servers[serverId] != undefined && this.servers[serverId].queue != undefined) {
            const queue = this.servers[serverId].queue;
            this.servers[serverId].player = false;
            this.servers[serverId].stream.end('Starting next song');

            this.disableMusicEmbed(serverId);

            if (this.servers[serverId].timer != null) {
                this.servers[serverId].timer.destroy();
                this.servers[serverId].timer = null;
            }

            if (queue[this.config.maxprequeue] == null) {
                this.servers[serverId].queue.splice(this.config.maxprequeue, 1);
                this.servers[serverId].queue.unshift(null);
            }

            if (queue[this.config.maxprequeue] != null && queue[this.config.maxprequeue].repeat == 1) {
                return this.continueQueue(serverId, voicechannel);
            }
            else {
                // Otherwise we stop and leave voicechannel
                if (queue[this.config.maxprequeue + 1] == null) {
                    if (this.servers[serverId].repeat == 1) {
                        this.repeatQueue(serverId, () => {
                            this.continueQueue(serverId, voicechannel);
                        });
                    }
                    else {
                        // Set queue to undefined for performance
                        this.servers[serverId] = undefined;
                        setTimeout(function () {
                            return voicechannel.leave();
                        }, 500);
                    }
                }
                // if the next in queue isn't null we can continue our play
                else {
                    if (!exception) {
                        this.servers[serverId].queue.shift();
                    }

                    return this.continueQueue(serverId, voicechannel);
                }
            }
        }
    }

    playNextInQueue(serverId, reqResponse, userId, funCallback) {
        this.getSongData(reqResponse, data => {
            this.servers[serverId].queue.splice(this.config.maxprequeue + 1, 0, Object.assign(reqResponse, {repeat: 0, requester: userId, songData: data, length: data.length}));

            return funCallback();
        });

        return;
    }

    playPrevious(serverId, voicechannel) {
        if (this.servers[serverId].queue != undefined) {
            const queue = this.servers[serverId].queue;
            // Disable repeat to prevent a mess
            if (queue[this.config.maxprequeue].repeat == 1) {
                queue[this.config.maxprequeue].repeat = 0;
            }

            if (queue[this.config.maxprequeue - 1] != null) {
                this.servers[serverId].queue.unshift(null);
                this.playNext(serverId, voicechannel, true);
                return true;
            }

            return false;
        }
    }

    removeSong(serverId, number) {
        if (number == null || (!isNaN(number) && number == 1)) {
            // We set the currently running song so we know it has been removed
            this.servers[serverId].queue[this.config.maxprequeue] = null;
            //this.servers[serverId].queue.unshift(null);
            return true;
        }

        if (isNaN(number) && number != 0) {
            return false;
        }

        let position = 0;

        if (number > 0) {
            position = this.servers[serverId].queue[this.config.maxprequeue + (number - 1)];
        }
        else {
            position = this.servers[serverId].queue[this.config.maxprequeue + number];
        }

        if (position == null || position == undefined) {
            return false;
        }

        if (number > 0) {
            this.servers[serverId].queue.splice(this.config.maxprequeue + (number - 1), 1);
        }
        else {
            this.servers[serverId].queue.splice(this.config.maxprequeue + number - 1, 1);
        }

        this.servers[serverId].queue.unshift(null);

        return true;
    }

    repeat(serverId, funCallback=null) {
        const repeat = this.servers[serverId].queue[this.config.maxprequeue].repeat;
        if (repeat == 0) {
            this.servers[serverId].queue[this.config.maxprequeue].repeat = 1;

            if (funCallback != null) {
                return funCallback(true);
            }
        }
        else {
            this.servers[serverId].queue[this.config.maxprequeue].repeat = 0;

            if (funCallback != null) {
                return funCallback(false);
            }
        }
    }

    repeatToggle(serverId, funCallback=null) {
        const
            playlistRepeat = this.servers[serverId].repeat,
            repeat = this.servers[serverId].queue[this.config.maxprequeue].repeat;

        // For some reason NodeJS copies instead of passing by reference
        // not like it FUCKING matters
        if (repeat == 0) {
            if (playlistRepeat == 0) {
                this.servers[serverId].queue[this.config.maxprequeue].repeat = 1;
            }
            else {
                this.servers[serverId].queue[this.config.maxprequeue].repeat = 0;
            }
            this.servers[serverId].repeat = 0;
        }
        else {
            this.servers[serverId].repeat = 1;
            this.servers[serverId].queue[this.config.maxprequeue].repeat = 0;
        }

        if (funCallback != null) {
            return funCallback();
        }

        return;
    }

    repeatQueue(serverId, funCallback=null) {
        while (this.servers[serverId].queue[this.config.maxprequeue - 1] != null) {
            this.servers[serverId].queue.unshift(null);
        }

        if (funCallback != null) {
            funCallback();
        }
    }

    repeatQueueToggle(serverId, funCallback=null) {
        const repeat = this.servers[serverId].repeat;
        let cb = false;
        this.servers[serverId].queue[this.config.maxprequeue].repeat = 0;

        if (repeat == 0) {
            this.servers[serverId].repeat = 1;
            
            cb = true;
        }
        else {
            this.servers[serverId].repeat = 0;
        }

        if (funCallback != null) {
            return funCallback(true);
        }
    }

    resumePlayback(serverId, funCallback=null) {
        if (this.servers[serverId].paused) {
            this.servers[serverId].stream.resume();
            this.servers[serverId].timer.resume();
            this.servers[serverId].paused = false;

            let footer = 'Repeat: OFF';
            if (this.servers[serverId].queue[this.config.maxprequeue].repeat == 1) {
                footer = 'Repeat: ON';
            }

            this.editEmbed(serverId, { footer: footer, color: '#32cd32', thumbnail: 'https://damon.ilysi.com/_users/yimura/home/play_inverted.png' });

            this.servers[serverId].msgObj.member.setNickname(this.bot.user.username);

            if (funCallback != null) {
                return funCallback();
            }
        }

        return;
    }

    setVolume(serverId, volume) {
        volume = volume / 100;
        // Save volume in our global var
        this.servers[serverId].volume = volume;
        // Set the volume on the player
        this.servers[serverId].stream.setVolume(volume);
    }

    startQueue(guild, voicechannel, funCallback) {
        this.continueQueue(guild, voicechannel);
        return funCallback();
    }
}

module.exports = {
    MusicSystem: MusicSystem
};
