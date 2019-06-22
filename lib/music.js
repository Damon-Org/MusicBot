const
    { GetThumbnail, OverflowText, Timer, HandleException } = require('./functions'),
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

    /* @class method
     *  Adds a song to the queue
     */
    addToQueue(serverId, reqResponse, userId, funCallback) {
        // Get queue length so we know where to append our song
        const length = this.servers[serverId].queue.length;

        // We get the song data from a class method and await for a response in the callback =>
        this.getSongData(reqResponse, data => {
            // With the length of our array we can add our songObj to the second last spot as we have a null element in the last array index that marks the end of queue
            this.servers[serverId].queue[length - 1] = Object.assign(reqResponse, {repeat: 0, requester: userId, songData: data, length: data.length});
            // Set last in array to null to mark the end of queue <=
            this.servers[serverId].queue[length] = null;

            // this function always expects a callback, because of async handlers we use a callback that signifies we found and added the song
            return funCallback(data.videoData.title);
        });
        return ;
    }

    /* @class method
     *  Creates an embed in which there are options listed from a YT search
     */
    choiceEmbed(msgObj, voicechannel, search, exception=false) {
        const
            serverId = msgObj.guild.id,
            userId = msgObj.author.id;
        let
            embedDescr = 'Songs: ',
            songs = [];

        // Check if the server object exists if it doesn't =>
        if (!this.servers[serverId]) {
            // We initialize our serverObj
            this.servers[serverId];
            // And assign our choiceObj to the serverObj
            this.servers[serverId] = {choiceObj: {}};
        }
        // if our serverObj already exists then we just =>
        else if (!this.servers[serverId].choiceObj) {
            // assign our choiceObj to the serverObj
            this.servers[serverId] = Object.assign(this.servers[serverId], {choiceObj: {}});
        }

        // In this for loop we =>
        for (let i = 0; i < search.length; i++) {
            // create an array of songObjs which are part of the choiceObj
            songs[i] = {
                id: search[i].id.videoId,
                source: 'yt'
            };
            // And build the choice embed description
            embedDescr += '\n#'+ (i+1) +': **' + search[i].snippet.title +'**';
        }

        // Do some variable assignments
        let
            embed = new RichEmbed(),
            fail = false;
        // If no songs have been found we just tell the user so
        if (songs.length == 0) {
            embed.setTitle('I could not find the song you requested')
                .setDescription('No results returned from the query you gave.')
                .setColor('#ed4337');

            fail = true;
        }
        // otherwise we finalize the choiceEmbed and prepare it for sending
        else {
            embed.setTitle('Choose a song:')
                .setColor('#252422')
                .setDescription(embedDescr)
                .setFooter('You can select a song by pressing the buttons below...');
        }

        // We initialize the choiceObj by userId because multiple users could be choosing at the same time
        this.servers[serverId].choiceObj[userId];
        // Send our embed and await for discord.js to return a promise of our msg
        msgObj.channel.send(embed)
        .then(msg => {
            // After receiving this msgObj we assign it to our choiceObj and if there was no fail (hence why we set the variable "fail")
            this.servers[serverId].choiceObj[userId] = {
                choices: songs,
                msgObj: msg,
                voicechannel: voicechannel,
                exception: exception
            };
            // then we send the choiceEmbedListener (just some emoji's => botevents will catch these and will then queue the correct song)
            if (!fail) {
                return this.choiceEmbedListener(msg);
            }
            // if no songs were found we just remove the choiceObj to make some memory free
            this.servers[serverId].choiceObj[userId] = undefined;
        });
    }

    /* @class method
     *  Checks if the bot is in a permanent failure loop, works sometimes.
     */
    checkPermanentFailure(serverId, voicechannel) {
        if (!(!voicechannel) && !this.isDamonInVC(voicechannel) && this.servers[serverId] != undefined && this.servers[serverId].queue != undefined && this.servers[serverId].queue.length > 0) {
            this.destroyQueueDidNotStart(serverId);
            return true;
        }

        return false;
    }

    /* @class method
     *  Will react to a messageObj and prepare this message for user choice
     */
    choiceEmbedListener(msgObj) {
        // const emojis = ['\u0030\u20E3','\u0031\u20E3','\u0032\u20E3','\u0033\u20E3','\u0034\u20E3','\u0035\u20E3', '\u0036\u20E3','\u0037\u20E3','\u0038\u20E3','\u0039\u20E3'];
        const emojis = ['\u0031\u20E3','\u0032\u20E3','\u0033\u20E3','\u0034\u20E3','\u0035\u20E3', '🚫'];
        // Custom for loop that interprets discord's trash delay
        react();
        function react(i=0) {
            if (i < emojis.length) {
                try {
                    msgObj.react(emojis[i])
                    .then(() => {
                        react(i+1);
                    }).catch(e => { HandleException(e) });
                } catch (e) { HandleException(e); }
            }
        }
    }

    /* @class method
     *  Just a renamed function to make it clear what it does, it continues the queue
     */
    continueQueue(serverId, voicechannel) {
        // will just call playSound
        this.playSound(serverId, voicechannel);
    }

    /* @class method
     *  Sets up a queue for server
     */
    createQueue(serverId, reqResponse, channel, userId, funCallback) {
        // assign base array to variable to avoid as much duplicate code as possible
        const base = {queue: [], volume: 0.15, recording: false, repeat: 0, timer: null, stream: null, paused: false, channel: channel, msgObj: null};

        // check if serverObj already exists
        if (!this.servers[serverId]) {
            // if not we initialize it
            this.servers[serverId];
            // and assign our base array to it
            this.servers[serverId] = base;
        }
        else {
            // otherwise if it exists we just assign our base to it
            this.servers[serverId] = Object.assign(this.servers[serverId], base);
        }

        // We assign the empty slots in our queue, people can have up to 50 songs in prequeue => songs that you can previous towards
        for (var i = 0; i < this.config.maxprequeue; i++) {
            this.servers[serverId].queue[i] = null;
        }

        // fetch songdata and assign it to the last index in the array
        this.getSongData(reqResponse, data => {
            this.servers[serverId].queue[i] = Object.assign(reqResponse, {repeat: 0, requester: userId, songData: data, length: data.length});
            // By assigning the last in the queue to be null we know this is the end of our queue
            this.servers[serverId].queue[i+1] = null;

            // return callback to the initializer
            return funCallback(data.videoData.title);
        });

        return;
    }

    /* @class method
     *  creates a countdown to prevent songs from ending early just because the audio stream quit early
     */
    createStreamCountdown(serverId) {
        // assigns playlength of song to a variable
        const songLength = this.servers[serverId].queue[this.config.maxprequeue].length;

        // Create a custom timer instance and assign it to .timer
        this.servers[serverId].timer = new Timer(() => {
            console.log('Song has expired');
        }, songLength * 1000 + 100);
    }

    /* @class method
     *  Returns the current volume of the queue
     */
    currentVolume(serverId) {
        return this.servers[serverId].volume;
    }

    /* @class method
     *  Destroys a queue
     */
    destroyQueue(serverId, funCallback) {
        this.disableMusicEmbed(serverId, () => {
            // We call .end on our stream and tell that the last song has already been disabled
            this.servers[serverId].stream.end('lastSongAlreadyDisabled');

            // And we make sure our bot has its default name again
            // this.servers[serverId].msgObj.member.setNickname(this.bot.user.username);
            // Afterwards we set our queue to undefined and keep our other objects alive.
            this.servers[serverId] = undefined;

            return funCallback();
        });
    }

    /* @class method
     *  Queue did not start for some reason and so we have to reset our queue by setting it to undefined
     */
    destroyQueueDidNotStart(serverId) {
        this.servers[serverId].queue = undefined;
    }

    /* @class method
     *  If a song ends its embed is copied and altered to appear disabled when a song ends
     */
    disableMusicEmbed(serverId, funCallback=null) {
        // Double checks if the serverObj still exists
        if (this.servers[serverId] != undefined) {
            const msgObj = this.servers[serverId].msgObj;

            // Checks if the last msgObj which contained the embed is still available
            if (msgObj == null) {
                if (funCallback != null) {
                    return funCallback();
                }

                return;
            }

            // Basic assignments
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

            // Clears reactions of disabled embed and catches potential errors
            msgObj.clearReactions()
            .catch(err => {
                // if clearReactions errors this means we do not have the manage message permission and thus throw this error to the chat
                const
                    msgChannel = this.bot.channels.get(this.servers[serverId].channel),
                    embed = new RichEmbed()
                        .setColor('#ff0033')
                        .setDescription('The following error was generated while trying to remove reactions: \n```'+ err.stack +'```');
                msgChannel.send(embed);

                HandleException(err, msgObj.guild);
            });
        }

        if (funCallback != null) {
            funCallback();
        }
    }

    /* @class method
     *  Edits an embed to a paused/resumed state depending on the editObj
     */
    editEmbed(serverId, editObj, funCallback=null) {
        // Checks if the serverObj exists
        if (this.servers[serverId] != undefined) {
            const msgObj = this.servers[serverId].msgObj;

            // Checks if there is a msgObj available to be edited
            if (msgObj == null) {
                if (funCallback != null) {
                    return funCallback();
                }

                return;
            }

            // these can't be constant assignments because we have to modify them
            let
                embed = msgObj.embeds[0],
                author = embed.author,
                title = embed.title,
                description = embed.description,
                color = embed.hexColor,
                footer = embed.footer;

            if (editObj.author != undefined) {
                author = editObj.author;
            }
            if (editObj.title != undefined) {
                title = editObj.title;
            }
            if (editObj.description != undefined) {
                description = editObj.description;
            }
            if (editObj.footer != undefined) {
                footer.text = editObj.footer;
            }
            if (editObj.color != undefined) {
                color = editObj.color;
            }

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
                        length: (data.duration / 1000),
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
                const options = (!songObj.prematureStart) ? {quality: 'highestaudio', highWaterMark: 1024 * 1024 * 10} : {quality: 'highestaudio', highWaterMark: 1024 * 1024 * 10, begin: songObj.prematureStart};

                return ytdl('https://youtu.be/' + songObj.id, options);
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
                .setDescription('\nRequested by: **'+ this.bot.users.get(serverObj.queue[this.config.maxprequeue].requester) + '**')
                .setFooter('👀 '+ data.videoData.viewCount);

                break;
            case 'sc':
                embed
                .setAuthor(data.author.name, data.author.avatar, data.author.url)
                .setTitle(OverflowText(data.videoData.title, 60))
                .setColor('#32cd32')
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
                try {
                    msgObj.react(emojis[i])
                    .then(() => {
                        react(i+1);
                    }).catch(e => { HandleException(e) });
                } catch (e) { HandleException(e); }
            }
        }
    }

    pausePlayback(serverId, funCallback=null) {
        if (!this.servers[serverId].paused) {
            this.servers[serverId].stream.pause();
            this.servers[serverId].timer.pause();
            this.servers[serverId].paused = true;

            this.editEmbed(serverId, { footer: 'SONG PAUSED', color: '#dd0a35'});

            // this.servers[serverId].msgObj.member.setNickname(this.bot.user.username + ' (Paused)');

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

    /*
     * Will create an embed asking the user if they want to add the entire playlist that got detected or only the single song
     */
    playlistEmbed(msgObj, voicechannel, response) {
        const
            serverId = msgObj.guild.id,
            userId = msgObj.author.id;

        if (!this.servers[serverId]) {
            this.servers[serverId];
            this.servers[serverId] = {playlistObj: {}};
        }
        else if (!this.servers[serverId].playlistObj) {
            this.servers[serverId] = Object.assign(this.servers[serverId], {playlistObj: {}});
        }

        this.servers[serverId].playlistObj[userId];

        this.servers[serverId].playlistObj[userId] = {
            song: response,
            msgObj: msgObj,
            voicechannel: voicechannel
        };

        const embed = new RichEmbed()
            .setAuthor('Playlist Detected')
            .setColor('#252422')
            .setDescription('I\'ve detected that this music video has a playlist.\nDo you want to add the entire playlist?')
            .setFooter('playlist_detected');

        msgObj.channel.send(embed)
        .then(message => {
            this.servers[serverId].playlistObj[userId].message = message;
            this.addYesNoEmojis(message);
        });
    }

    addYesNoEmojis(msgObj) {
        const emojis = ['✔', '✖'];

        react();
        function react(i=0) {
            if (i < emojis.length) {
                try {
                    msgObj.react(emojis[i])
                    .then(() => {
                        react(i+1);
                    }).catch(e => { HandleException(e) });
                } catch (e) { HandleException(e); }
            }
        }
    }

    playSound(serverId, voicechannel) {
        if (this.servers[serverId] != undefined) {
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
                    return voicechannel.leave();
                }

                const musicStream = this.getStream(this.servers[serverId].queue[this.config.maxprequeue]);
                const audioStream = conn.playStream(musicStream);

                this.musicEmbed(this.servers[serverId]);

                // Set our timer and datastream
                this.servers[serverId].stream = audioStream;
                this.createStreamCountdown(serverId);

                audioStream.setVolume(this.servers[serverId].volume);

                audioStream.on('end', end => {
                    if (end == 'startingNextSong' || end == 'lastSongAlreadyDisabled') {
                        return;
                    }

                    return this.playNext(serverId, voicechannel);
                });
            }).catch(err => {
                const
                    msgChannel = this.bot.channels.get(this.servers[serverId].channel),
                    embed = new RichEmbed()
                        .setColor('#ff0033')
                        .setDescription('The following error was generated while trying to play music: \n```'+ err.stack +'```');

                msgChannel.send(embed);

                HandleException(err, msgObj.guild);
            });
        }
    }

    playNext(serverId, voicechannel, exception=false) {
        if (this.servers[serverId] != undefined && this.servers[serverId].queue != undefined) {
            const queue = this.servers[serverId].queue;
            this.servers[serverId].stream.end('startingNextSong');

            this.disableMusicEmbed(serverId);

            if (this.servers[serverId].timer != null) {
                this.servers[serverId].timer.destroy();
                this.servers[serverId].timer = null;
            }

            // Remove null element from queue because currently playing song was removed
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
                        setTimeout(() => {
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

            return funCallback(data.videoData.title);
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
        if (number < -this.config.maxprequeue) {
            return false;
        }

        if (number == null || (!isNaN(number) && number == 1)) {
            // We set the currently running song to null so we know it has been removed
            this.servers[serverId].queue[this.config.maxprequeue] = null;
            //this.servers[serverId].queue.unshift(null);
            return true;
        }

        number = parseInt(number, 10);
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
            this.servers[serverId].queue.splice(this.config.maxprequeue + number, 1);
            this.servers[serverId].queue.unshift(null);
        }

        return true;
    }

    repeat(serverId, funCallback=null) {
        const repeat = this.servers[serverId].queue[this.config.maxprequeue].repeat;
        if (repeat == 0) {
            this.servers[serverId].queue[this.config.maxprequeue].repeat = 1;

            this.editEmbed(serverId, { footer: 'Repeat: ON', color: '#cccccc'});

            if (funCallback != null) {
                return funCallback(true);
            }
        }
        else {
            this.servers[serverId].queue[this.config.maxprequeue].repeat = 0;

            this.editEmbed(serverId, { footer: 'Repeat: OFF', color: '#32cd32'});

            if (funCallback != null) {
                return funCallback(false);
            }
        }
    }

    repeatToggle(serverId, funCallback=null) {
        const
            playlistRepeat = this.servers[serverId].repeat,
            repeat = this.servers[serverId].queue[this.config.maxprequeue].repeat;

        let
            footer = '',
            color = '#cccccc';

        // For some reason NodeJS copies instead of passing by reference
        // not like it FUCKING matters
        if (repeat == 0) {
            if (playlistRepeat == 0) {
                this.servers[serverId].queue[this.config.maxprequeue].repeat = 1;

                footer = 'Repeat: ON';
            }
            else {
                this.servers[serverId].queue[this.config.maxprequeue].repeat = 0;

                footer = 'Repeat: OFF';
                color = '#32cd32';
            }
            this.servers[serverId].repeat = 0;
        }
        else {
            this.servers[serverId].repeat = 1;
            this.servers[serverId].queue[this.config.maxprequeue].repeat = 0;

            footer = 'Playlist Repeat: ON';
            color = '#32cd32';
        }

        this.editEmbed(serverId, { footer: footer, color: color});

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
            return funCallback(cb);
        }
    }

    resumePlayback(serverId, funCallback=null) {
        if (this.servers[serverId].paused) {
            this.servers[serverId].stream.resume();
            this.servers[serverId].timer.resume();
            this.servers[serverId].paused = false;

            let footer = 'Repeat: OFF';
            let color = '#32cd32';
            if (this.servers[serverId].queue[this.config.maxprequeue].repeat == 1) {
                footer = 'Repeat: ON';
                color = '#cccccc';
            }

            this.editEmbed(serverId, { footer: footer, color: color});

            // this.servers[serverId].msgObj.member.setNickname(this.bot.user.username);

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

    songEndedPrematurely(serverId, voicechannel, endTime) {
        if (!this.servers[serverId].timer) {
            return;
        }

        const songStartTime = this.servers[serverId].timer.created;

        this.servers[serverId].queue[this.config.maxprequeue].prematureStart = (endTime - songStartTime);
        this.servers[serverId].queue.unshift(null);

        this.playNext(serverId, voicechannel);
    }

    startQueue(guild, voicechannel, funCallback) {
        this.continueQueue(guild, voicechannel);
        return funCallback();
    }
}

module.exports = {
    MusicSystem: MusicSystem
};
