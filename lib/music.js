const
    { GetThumbnail, OverflowText } = require('./functions'),
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
            this.servers[serverId].queue[length - 1] = Object.assign(reqResponse, {repeat: 0, requester: userId, songData: data});
            // Set last in array to null to mark the end of queue
            this.servers[serverId].queue[length] = null;

            return funCallback();
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

        if (this.servers[serverId] == undefined) {
            this.servers[serverId];
            this.servers[serverId] = {choiceObj: {}};
        }
        else if (this.servers[serverId].choiceObj == undefined)
            this.servers[serverId] = Object.assign(this.servers[serverId], {choiceObj: {}});

        for (var i = 0; i < search.length; i++) {
            songs[i] = {
                id: search[i].id.videoId,
                source: 'yt'
            };

            embedDescr += '\n#'+ (i+1) +': **' + search[i].snippet.title +'**';
        }

        const embed = new RichEmbed()
            .setTitle('Choose a song:')
            .setColor('#252422')
            .setDescription(embedDescr)
            .setFooter('You can select a song by pressing the buttons below...');


        this.servers[serverId].choiceObj[userId];
        msgObj.channel.send(embed)
        .then(msg => {
            this.servers[serverId].choiceObj[userId] = {
                choices: songs,
                msgObj: msg,
                voicechannel: voicechannel,
                exception: exception
            };

            this.choiceEmbedListener(msg);
        });
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
        if (this.servers[serverId] == undefined) {
            this.servers[serverId];
            this.servers[serverId] = {queue: [], volume: 0.15, playing: false, stream: null, paused: false, channel: channel, msgObj: null};
        }
        else
            this.servers[serverId] = Object.assign(this.servers[serverId], {queue: [], volume: 0.15, playing: false, stream: null, paused: false, channel: channel, msgObj: null});

        for (var i = 0; i < this.config.maxprequeue; i++)
            this.servers[serverId].queue[i] = null;

        this.getSongData(reqResponse, data => {
            this.servers[serverId].queue[i] = Object.assign(reqResponse, {repeat: 0, requester: userId, songData: data});
            // By assigning the last in the queue to be null we know this is the end of our queue
            this.servers[serverId].queue[i+1] = null;

            return funCallback();
        });
        return ;
    }

    destroyQueue(serverId, funCallback) {
        this.disableMusicEmbed(serverId, () => {
            this.servers[serverId].stream.end('lastSongAlreadyDisabled');
            this.servers[serverId] = undefined;

            return funCallback();
        });
    }

    disableMusicEmbed(serverId, funCallback=null) {
        const
            msgObj = this.servers[serverId].msgObj,
            embed = msgObj.embeds[0],
            author = embed.author,
            title = embed.title,
            description = embed.description,
            footer = embed.footer,
            disableEmbed = new RichEmbed()
                .setAuthor(author.name, author.iconURL, author.url)
                .setTitle(title)
                .setColor('#ed4337')
                .setDescription(description)
                .setFooter(footer.text);

        if (embed.thumbnail != null)
            disableEmbed.setThumbnail(embed.thumbnail.url);

        msgObj.edit(disableEmbed);
        msgObj.clearReactions();

        if (funCallback != null)
            funCallback();
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

    getStream(songObj) {
        if (songObj.source == 'yt')
            return ytdl('https://youtu.be/' + songObj.id, {filter: 'audioonly', quality: 'highestaudio'});
        if (songObj.source == 'sc')
            return API.getSoundCloudStream(songObj.id);
    }

    hasQueue(serverId) {
        if (this.servers[serverId] != undefined && this.servers[serverId].queue != undefined)
            return true;
        return false;
    }

    isDragonInVC(voicechannel) {
        if (voicechannel.members.get(this.bot.user.id))
            return true;
        return false;
    }

    musicEmbed(serverObj) {
        const
            msgChannel = this.bot.channels.get(serverObj.channel),
            songObj = serverObj.queue[this.config.maxprequeue],
            data = songObj.songData;

        let embed = new RichEmbed();

        if (songObj.source == 'yt') {
            embed
                .setAuthor(data.author.name, data.author.avatar, data.author.channel_url)
                .setTitle(OverflowText(data.videoData.title, 60))
                .setColor('#32cd32')
                .setThumbnail(data.thumbnail)
                .setDescription('\nRequested by: **'+ this.bot.users.get(serverObj.queue[this.config.maxprequeue].requester) + '**')
                .setFooter('👁 '+ data.videoData.viewCount);
        }

        if (songObj.source == 'sc') {
            embed
                .setAuthor(data.author.name, data.author.avatar, data.author.url)
                .setTitle(OverflowText(data.videoData.title, 60))
                .setColor('#32cd32')
                .setDescription('\nRequested by: **'+ this.bot.users.get(serverObj.queue[this.config.maxprequeue].requester) + '**')
                .setFooter('👁 '+ data.videoData.viewCount);

            if (data.thumbnail != null)
                embed.setThumbnail(data.thumbnail);
        }

        msgChannel.send({embed})
        .then(msgObj => {
            serverObj.msgObj = msgObj;

            this.musicEmbedListener(msgObj);
        });
    }

    musicEmbedListener(msgObj) {
        const emojis = ['⏮', '⏸', '⏭', '🔂'];

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
            this.servers[serverId].paused = true;

            if (funCallback != null)
                return funCallback(true);
        }
    }

    pauseToggle(serverId) {
        const paused = this.servers[serverId].paused;

        if (paused == true)
            return this.resumePlayback(serverId);
        return this.pausePlayback(serverId);
    }

    playSound(serverId, voicechannel) {
        if (!this.servers[serverId].player && this.servers[serverId] != undefined) {
            let queue = this.servers[serverId].queue;
            voicechannel.join().then(conn => {
                if (this.servers[serverId] == undefined)
                    return ;
                const musicStream = this.getStream(this.servers[serverId].queue[this.config.maxprequeue]);
                const audioStream = conn.playStream(musicStream);

                this.musicEmbed(this.servers[serverId]);

                // Set our player and datastream
                this.servers[serverId].player = true;
                this.servers[serverId].stream = audioStream;

                audioStream.setVolume(this.servers[serverId].volume);

                audioStream.on('end', end => {
                    //console.log('End of song detected');
                    //console.log(end);

                    if (end != 'lastSongAlreadyDisabled') {
                        this.disableMusicEmbed(serverId);
                    }
                    if (this.servers[serverId].player)
                        return this.playNext(serverId, voicechannel);
                    return ;
                });
            }).catch(err => {
                const
                    msgChannel = this.bot.channels.get(this.servers[serverId].channel),
                    embed = new RichEmbed()
                        .setColor('#ff0033')
                        .setDescription('The following error was generated while trying to play music: \n```'+ err.toString() +'```');
                msgChannel.send(embed);
            });
        }
    }

    playNext(serverId, voicechannel, exception=false) {
        if (this.servers[serverId] != undefined && this.servers[serverId].queue != undefined) {
            const queue = this.servers[serverId].queue;
            this.servers[serverId].player = false;
            this.servers[serverId].stream.end('Starting next song');

            if (queue[this.config.maxprequeue].repeat == 1)
                return this.continueQueue(serverId, voicechannel);
            else {
                // Otherwise we stop and leave voicechannel
                if (queue[this.config.maxprequeue + 1] == null) {
                    // Set queue to undefined for performance
                    this.servers[serverId] = undefined;
                    setTimeout(function () {
                        return voicechannel.leave();
                    }, 500);
                }
                // if the next in queue isn't null we can continue our play
                else {
                    if (!exception)
                        this.servers[serverId].queue.shift();
                    return this.continueQueue(serverId, voicechannel);
                }
            }
        }
    }

    playNextInQueue(serverId, reqResponse, userId, funCallback) {
        this.getSongData(reqResponse, data => {
            this.servers[serverId].queue.splice(this.config.maxprequeue + 1, 0, Object.assign(reqResponse, {repeat: 0, requester: userId, songData: data}));

            return funCallback();
        });
        return ;
    }

    playPrevious(serverId, voicechannel) {
        if (this.servers[serverId].queue != undefined) {
            const queue = this.servers[serverId].queue;
            // Disable repeat to prevent a mess
            if (queue[this.config.maxprequeue].repeat == 1)
                queue[this.config.maxprequeue].repeat = 0;
            if (queue[this.config.maxprequeue - 1] != null) {
                this.servers[serverId].queue.unshift(null);
                this.playNext(serverId, voicechannel, true);
                return true;
            }
            else
                return false;
        }
    }

    repeat(serverId, funCallback=null) {
        const repeat = this.servers[serverId].queue[this.config.maxprequeue].repeat;
        if (repeat == 0) {
            this.servers[serverId].queue[this.config.maxprequeue].repeat = 1;

            if (funCallback != null)
                return funCallback(true);
        }
        else {
            this.servers[serverId].queue[this.config.maxprequeue].repeat = 0;

            if (funCallback != null)
                return funCallback(false);
        }
    }

    resumePlayback(serverId, funCallback=null) {
        if (this.servers[serverId].paused) {
            this.servers[serverId].stream.resume();
            this.servers[serverId].paused = false;
            if (funCallback!=null)
                return funCallback();
        }
        return;
    }

    serverExistsInQueue(serverId) {
        if (this.servers[serverId] != undefined)
            return true;
        return false;
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
