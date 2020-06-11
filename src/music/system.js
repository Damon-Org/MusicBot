const
    DJManager = require('./dj/manager'),

    Shutdown = require('./shutdown'),
    Queue = require('./queue'),

    LavaTrack = require('./track/lava'),
    SpotifyTrack = require('./track/spotify');

/**
 * Music System that manages the queue and handles all music related commands
 * @category MusicSystem
 */
class MusicSystem {
    /**
     * @constructs
     * @param {MusicBot} musicBot A MusicBot Instance
     * @param {Server} serverInstance A Server Instance
     */
    constructor(musicBot, serverInstance) {
        /**
         * @type {MusicBot}
         * @readonly
         */
        this.musicBot = musicBot;
        /**
         * @type {Server}
         * @readonly
         */
        this.serverInstance = serverInstance;

        /**
         * @type {external:Discord_Client}
         * @readonly
         */
        this.client = this.musicBot.client;
        /**
         * @type {Queue}
         */
        this.queue = new Queue();
        /**
         * @type {Shutdown}
         */
        this.shutdown = new Shutdown(this);
        /**
         * @type {DJManager}
         */
        this.djManager = new DJManager(this);

        this.reset();
    }

    get carrier() {
        return this.musicBot.carrier;
    }

    get node() {
        return this.musicBot.carrier.getNode();
    }

    /**
     * Adds a song to the queue together with its requester
     * @param {external:Object} track Data found by the LavaLink REST APi
     * @param {external:Discord_GuildMember} serverMember A Discord.GuildMember instance
     * @param {external:Boolean} exception If the song should be played next up or handled normally
     */
    addToQueue(track, requester, exception = false) {
        track.requester = requester;

        if (exception) {
            this.cacheSongIfNeeded(track);

            return this.queue.addOnPosition(track, 2);
        }
        this.cacheSongIfNeeded();

        return this.queue.add(track);
    }

    async cacheSongIfNeeded(track = null) {
        if (track == null) {
            track = this.queue.getFromPosition(2);

            if (track == null) return;
        }

        if (track instanceof SpotifyTrack && !track.cached)
            await track.getYouTubeEquiv();
    }

    /**
     * Will pass on to the next song
     * @param {external:Discord_VoiceChannel} voiceChannel A Discord.VoiceChannel instance
     */
    async continueQueue(voiceChannel = null) {
        if (await this.playSong(voiceChannel)) {
            this.ended = false;

            await this.createNewPlayer();

            return true;
        }

        return false;
    }

    /**
     * Will create a nice embed that looks like a player interface
     */
    async createNewPlayer() {
        this.updateSongState();

        const track = this.queue.active();
        if (this.lastMsg && this.channel.lastMessageID == this.lastMsg.id) {
            const embedUtils = this.musicBot.embedUtils;
            embedUtils.editEmbed(this.lastMsg, {
                author: { name: track.full_author },
                color: this.songState.color,
                description: `Requested by: **${track.requester}**`,
                thumbnail: track.image ? track.image : null,
                title: track.title,
                footer: {
                    text: this.songState.footer
                }
            });

            return;
        }

        this.disableOldPlayer(true);

        const richEmbed = new this.musicBot.Discord.MessageEmbed()
                .setAuthor(track.author)
                .setTitle(track.title)
                .setThumbnail(track.image ? track.image : null)
                .setColor(this.songState.color)
                .setDescription(`Requested by: **${track.requester}**`)
                .setFooter(this.songState.footer),
            newMsg = await this.channel.send(richEmbed),
            emojis = ['⏮️', '⏸', '⏭', '🔁'];

        this.lastMsg = newMsg;

        emojis.forEach(async emoji => {
            if (!newMsg.deleted) {
                await newMsg.react(emoji)
                .catch(e => {
                    if (e.message != 'Unknown Message') {
                        console.log(e.stack);
                    }
                });
            }
        });
    }

    /**
     * Sets the dedicated TextChannel and then passes the Song to MusicSystem#AddToQueue
     * @param {external:Object} data Data found by the LavaLink REST APi
     * @param {external:Discord_GuildMember} requester
     * @param {external:Discord_TextChannel} textChannel A Discord.TextChannel instance
     */
    async createQueue(data, requester, textChannel) {
        this.startTime = Date.now();

        this.channel = textChannel;

        data.requester = requester;
        await this.cacheSongIfNeeded(data);

        this.addToQueue(data, requester);
    }

    /**
     * Will disable the last musicPlayer of our bot
     * @param {external:Boolean} force If the old player should be force disabled no matter what
     */
    disableOldPlayer(force = false) {
        if (this.lastMsg && !this.lastMsg.deleted && (this.channel.lastMessageID != this.lastMsg.id || force)) {
            const embedUtils = this.musicBot.embedUtils;
            embedUtils.editEmbed(this.lastMsg, {
                color: '#4f545c'
            });

            this.lastMsg.reactions.removeAll()
            .catch(err => {
                this.channel.send(`Unknown error occured\nThis generated the following error: \`\`\`js\n${err.stack}\`\`\`Contact ${this.musicBot.creator} on Discord if this keeps occuring.`);
            });
        }
    }

    disconnect() {
        if (this.player) this.player.disconnect();
    }

    getPlayer(voiceChannel) {
        const player = this.carrier.getPlayer(voiceChannel.guild.id);
        if (player && this.isDamonInVC(voiceChannel))
            return player;

        if (player) player.disconnect();

        return this.node.joinVoiceChannel({
            guildID: voiceChannel.guild.id,
            voiceChannelID: voiceChannel.id
        });
    }

    /**
     * Checks if our bot is in the channel of that user doing the request if not return false
     * @param {external:Discord_VoiceChannel} voiceChannel A Discord.VoiceChannel instance
     * @returns {external:Boolean} True if Damon is in a voiceChannel, false if not
     */
    isDamonInVC(voiceChannel) {
        if (!voiceChannel) return false;
        return voiceChannel.members.has(this.client.user.id);
    }

    /**
     * @param {external:Number} index The index of the song in the Choice instance
     * @param {external:Discord_Message} msgObj
     * @param {external:Discord_User} user
     */
    async onChoiceEmbedAction(index, msgObj, user) {
        const choiceInstance = this.serverInstance.choices.get(user.id);
        if (choiceInstance == undefined || choiceInstance.listener.id != msgObj.id || choiceInstance.handled) {
            return;
        }

        if (index > 4) {
            msgObj.delete();

            return;
        }

        choiceInstance.handled = true;

        const
            requester = choiceInstance.requester,
            videoId = choiceInstance.rawData[index],
            voicechannel = choiceInstance.voicechannel;

        if (!videoId) {
            return;
        }

        let
            data = null,
            attempt = 0;

        do {
            data = await this.node.rest.resolve(`https://youtube.com/watch?v=${videoId}`);

            attempt++;
        } while ((!data || data.length == 0) && attempt < 3);

        if (!data || data.length == 0) {
            msgObj.channel.send(`${requester}, failed to queue song, perhaps the song is limited in country or age restricted?`)
                .then(msg => msg.delete({timeout: 5e3}));

            return;
        }

        data = new LavaTrack(data);

        if (!voicechannel.members.get(user.id)) {
            msgObj.channel.send(`${requester}, you've left your original voicechannel, request ignored.`)
                .then(msg => msg.delete({timeout: 5e3}));

            msgObj.delete();

            return;
        }

        this.musicBot.musicUtils.handleSongData(data, requester, msgObj, voicechannel, null, choiceInstance.shouldPlayNext);

        msgObj.delete();
        this.serverInstance.choices.delete(user.id);
    }

    /**
     * @param {external:Number} yesnoOption
     * @param {external:Discord_Message} msgObj
     * @param {external:Discord_User} user
     */
    async onPlaylistAction(yesnoOption, msgObj, user) {
        if (!this.serverInstance.playlists.has(user.id)) return;
        const playlistObj = this.serverInstance.playlists.get(user.id);
        if (playlistObj.msgObj.id != msgObj.id) return;

        msgObj.delete();

        const
            exception = playlistObj.exception,
            serverMember = playlistObj.requester,
            textchannel = msgObj.channel,
            voicechannel = playlistObj.voicechannel;

        if (!voicechannel.members.get(user.id)) {
            const newMsg = await msgObj.channel.send(`${serverMember}, you've left your original voicechannel, request ignored.`);

            newMsg.delete({timeout: 5000});

            return;
        }

        if (yesnoOption) {
            if (!playlistObj.videoId) {
                const richEmbed = new this.musicBot.Discord.MessageEmbed()
                    .setTitle('Playlist Exception.')
                    .setDescription(`Playlist link did not contain a song to select.`)
                    .setColor('#ed4337');

                msgObj.channel.send(richEmbed);

                return;
            }

            const data = await this.node.rest.resolve(`https://youtube.com/watch?v=${playlistObj.videoId}`);
            if (!data) {
                const richEmbed = new this.musicBot.Discord.MessageEmbed()
                    .setTitle('No results returned.')
                    .setDescription(`I could not find the track you requested or access to this track is limited.\nPlease try again with something other than what you tried to search for.`)
                    .setColor('#ed4337');

                msgObj.channel.send(richEmbed);

                return;
            }

            data = new LavaTrack(data);

            this.musicBot.musicUtils.handleSongData(data, serverMember, msgObj, voicechannel, null, exception);

            return;
        }


        for (let i = 0; i < playlistObj.playlist.length; i++) {
            const song = new LavaTrack(playlistObj.playlist[i]);
            if (!await this.musicBot.musicUtils.handleSongData(song, serverMember, msgObj, voicechannel, null, false, false)) break;
        }

        msgObj.channel.send('Successfully added playlist!');
    }

    nodeError(error) {
        this.shutdown.instant();
    }

    /**
     * Will handle any action on MusicPlayer Reactions
     * @param {external:String} emoji A unicode string of the emoji
     * @param {external:Discord_Message} msgObj
     * @param {external:Discord_User} user
     */
    async onMusicPlayerAction(emoji, msgObj, user) {
        if (!this.lastMsg || this.lastMsg.id != msgObj.id || !this.voiceChannel.members.get(user.id)) {
            return;
        }

        switch (emoji) {
            case '⏮️': {
                this.playPrevious();
                break;
            }
            case '⏸': {
                this.pauseToggle();
                break;
            }
            case '⏭': {
                this.player.stopTrack();
                break;
            }
            case '🔁': {
                if (!this.playerRepeatToggle()) {
                    const newMsg = await msgObj.channel.send('The currently playing song was removed and repeat has been disabled.');

                    newMsg.delete({timeout: 5000});
                }
                break;
            }
        }
    }

    /**
     * Method pauses music playback
     */
    pausePlayback() {
        if (!this.paused) {
            this.player.setPaused(true);

            this.paused = true;

            this.updateSongState();

            const embedUtils = this.musicBot.embedUtils;
            embedUtils.editEmbed(this.lastMsg, {
                color: this.songState.color,
                footer: {
                    text: this.songState.footer
                }
            });

            return true;
        }

        return false;
    }

    /**
     * Will toggle resume/pause depending on the state of the active song
     */
    pauseToggle() {
        if (this.paused) {
            this.resumePlayback();

            return;
        }

        this.pausePlayback();
    }

    /**
     * Will go through several checks of things that have to get updated before moving on to the next song
     */
    async playNext() {
        const activeSong = this.queue.active();

        if (activeSong == null) {
            this.queue.remove(null);
        }
        else if (activeSong.repeat) {
            this.continueQueue();

            return;
        }

        if (!this.doNotSkip && this.queue.getFromPosition(2) == null) {
            if (this.queue.repeat) {
                this.queue.rewind();

                this.continueQueue();
                return;
            }

            this.disableOldPlayer(true);
            this.channel.send(`Queue has been concluded and the bot will leave in 5 minutes, type the \`restart\` command to requeue your the old queue (only if within those same 5 minutes).`);
            this.shutdown.delay('leave', 3e5);

            return;
        }

        if (!this.doNotSkip) {
            this.queue.shift();
        }
        else {
            this.doNotSkip = false;
        }

        this.continueQueue();
    }

    /**
     * This will put the queue back to the previous song and then play the next song
     * @returns {Boolean} True on success, false when no more previous songs
     */
    async playPrevious() {
        this.doNotSkip = true;

        if (this.queue.active() == null) {
            // Remove the current active song
            this.queue.remove(null);

            this.queue.unshift(null);

            if (!await this.player.stopTrack()) this.soundEnd();
        }
        else if ((this.queue.active()).repeat) {
            (this.queue.active()).repeat = false;
        }

        if (this.queue.getFromPosition(-1) != null) {
            this.queue.unshift(null);

            if (!await this.player.stopTrack()) this.soundEnd();

            return true;
        }

        this.doNotSkip = false;

        return false;
    }

    /**
     * Toggles through all the repeat modes
     */
    playerRepeatToggle() {
        if (this.queue.active() == null) {
            return false;
        }

        const
            queueRepeat = this.queue.repeat,
            songRepeat = (this.queue.active()).repeat;

        if (!songRepeat) {
            if (!queueRepeat) {
                (this.queue.active()).repeat = true;
            }
            else {
                (this.queue.active()).repeat = false;
            }
            this.queue.repeat = false;
        }
        else {
            this.queue.repeat = true;
            (this.queue.active()).repeat = false;
        }

        const embedUtils = this.musicBot.embedUtils;

        this.updateSongState();

        embedUtils.editEmbed(this.lastMsg, {
            color: this.songState.color,
            footer: {
                text: this.songState.footer
            }
        });

        return true;
    }

    /**
     * @param {external:Discord_VoiceChannel} voiceChannel A Discord.VoiceChannel instance
     */
    async playSong(voiceChannel = null) {
        if (!this.voiceChannel) {
            if (!this.isDamonInVC(voiceChannel)) {
                if (voiceChannel.full && !voiceChannel.guild.me.hasPermission('ADMINISTRATOR')) {
                    const richEmbed = new this.musicBot.Discord.MessageEmbed()
                            .setTitle('Channel Full')
                            .setColor('#ff0033')
                            .setDescription('Voicechannel is full, try kicking someone or make the voicechannel size larger.');

                    this.channel.send(richEmbed);

                    this.shutdown.instant();
                    return false;
                }

                if (!voiceChannel.joinable) {
                    const richEmbed = new this.musicBot.Discord.MessageEmbed()
                        .setTitle('Insufficient permissions')
                        .setColor('#ff0033')
                        .setDescription('I do not have permission to join your channel.');

                    this.channel.send(richEmbed);

                    this.shutdown.instant();
                    return false;
                }
            }

            this.player = await this.getPlayer(voiceChannel);

            //this.player.on('closed', this.playerListener['closed'] = (reason) => this.playerDisconnected(reason));

            this.voiceChannel = voiceChannel;
        }

        const currentSong = this.queue.active();
        if (currentSong.broken) {
            this.channel.send(`No equivalent video could be found on YouTube for **${currentSong.title}**`);

            this.playNext();

            return false;
        }

        await this.cacheSongIfNeeded(currentSong);

        while (!await this.player.playTrack(currentSong.track)) {
            this.musicBot.log('MUSSYS', 'WARN', 'Failed to playTrack, retrying...');
        }
        await this.player.setVolume(this.volume);

        this.player.on('start', this.playerListener['start'] = () => this.soundStart());

        this.cacheSongIfNeeded();

        //this.player.on('closed', () => this.soundEnd(end));
        //this.player.on('nodeDisconnect', endFunction);

        return true;
    }

    /**
     * Will return true if a valid queue exists
     * @returns {external:Boolean}
     */
    queueExists() {
        return this.active;
    }

    /**
     * @param {external:Number} queueNumber A number that exists in queue
     */
    removeSong(queueNumber) {
        if (!queueNumber || queueNumber == '' || queueNumber.length == 0) {
            queueNumber = 1;
        }
        else if (isNaN(queueNumber) || queueNumber < -this.queue.maxPrequeue || queueNumber == 0) return false;

        queueNumber = parseInt(queueNumber);

        if (!this.queue.hasOnPosition(queueNumber)) return false;

        return this.queue.removeOnPosition(queueNumber);
    }

    /**
     * Enables entire queue repeat
     * @returns {external:Boolean}
     */
    repeatQueueToggle() {
        const queueRepeat = this.queue.repeat;

        if (this.queue.active() != null) {
            (this.queue.active()).repeat = false;
        }

        this.queue.repeat = !queueRepeat;

        this.updateSongState();
        embedUtils.editEmbed(this.lastMsg, {
            color: this.songState.color,
            footer: {
                text: this.songState.footer
            }
        });

        return this.queue.repeat;
    }

    /**
     * Repeat toggle for the command
     * @returns {external:Boolean}
     */
    repeatToggle() {
        const
            songRepeat = (this.queue.active()).repeat,
            embedUtils = this.musicBot.embedUtils;

        (this.queue.active()).repeat = !songRepeat;

        this.updateSongState();
        embedUtils.editEmbed(this.lastMsg, {
            color: this.songState.color,
            footer: {
                text: this.songState.footer
            }
        });

        return (this.queue.active()).repeat;
    }

    /**
     * Will reset all variables so our system is ready for a request
     */
    reset(disconnect = true) {
        if (disconnect) this.disconnect();

        this.disableOldPlayer(true);

        this.djManager.reset(true);
        this.shutdown.reset();
        this.queue.reset();

        if (this.player) this.player.removeAllListeners();

        this.playerListener = {};

        /**
         * @type {external:Discord_TextChannel}
         */
        this.channel = null;
        /**
         * @type {external:Discord_Message}
         */
        this.lastMsg = null;

        /**
         * @type {external:Boolean}
         */
        this.doNotSkip = false;
        /**
         * @type {external:Discord_VoiceChannel}
         */
        this.voiceChannel = null;

        /**
         * @type {external:Boolean}
         */
        this.active = false;
        /**
         * @type {external:Boolean}
         */
        this.paused = false;
        /**
         * @type {external:Number}
         */
        this.startTime = 0;
        /**
         * @type {*}
         */
        this.stream = null;
        /**
         * @type {external:Number}
         */
        this.volume = 30;

        this.updateSongState();
    }

    /**
     * Resumes the music
     */
    resumePlayback() {
        if (this.paused) {
            this.player.setPaused(false);

            this.paused = false;

            this.updateSongState();

            const embedUtils = this.musicBot.embedUtils;

            embedUtils.editEmbed(this.lastMsg, {
                color: this.songState.color,
                footer: {
                    text: this.songState.footer
                }
            });
        }

        return;
    }

    /**
     * @param {external:Number} queueNumber A number that exists in queue
     * @returns {external:Boolean} False if invalid queueNumber was given, true on success
     */
    async skipTo(queueNumber) {
        if (queueNumber == 1) return true;
        if (isNaN(queueNumber) || queueNumber < -this.queue.maxPrequeue || queueNumber == 0) return false;

        queueNumber = parseInt(queueNumber);

        if (!this.queue.hasOnPosition(queueNumber)) return false;

        const loopCount = queueNumber < 0 ? (queueNumber*-1 + 1) : queueNumber - 2;

        const nextSong = this.queue.getFromPosition(queueNumber);
        await this.cacheSongIfNeeded(nextSong);

        for (let i = 0; i < loopCount; i++) {
            if (queueNumber < 0) this.queue.unshift(null);
            else this.queue.shift(null);
        }

        if (!await this.player.stopTrack()) this.soundEnd();

        return true;
    }

    /**
     * Sets the volume on the active stream
     * @param {external:Number} volume
     * @returns False if unchanged, true otherwise
     */
    setVolume(volume) {
        if (this.volume == volume) {
            return false;
        }

        this.player.setVolume(volume);
        this.volume = volume;

        return true;
    }

    /**
     * @param {external:String} end A string end reason
     */
    soundEnd(end) {
        this.player.removeListener('error', this.playerListener['error']);
        this.playerListener['error'] = null;
        this.player.removeListener('end', this.playerListener['end']);
        this.playerListener['end'] = null;

        if (end.type == 'TrackStuckEvent') return;
        if (end.reason == 'LOAD_FAILED') {
            this.playSong();

            return;
        }

        const currentSong = this.queue.active();

        this.musicBot.log('MUSSYS', 'INFO', `Finished track: ${currentSong ? currentSong.title : '{ REMOVED SONG }'}`);

        this.playNext();
    }

    soundStart() {
        const currentSong = this.queue.active();

        this.musicBot.log('MUSSYS', 'INFO', 'Started track: ' + currentSong ? currentSong.title : '{ REMOVED SONG }');

        this.player.removeListener('start', this.playerListener['start']);
        this.playerListener['start'] = null;

        this.player.on('error', this.playerListener['error'] = (error) => this.nodeError(error));

        this.player.on('end', this.playerListener['end'] = (end) => this.soundEnd(end));
    }

    /**
     * Will start the queue in the given voicechannel
     * @param {external:Discord_VoiceChannel} voiceChannel A Discord.VoiceChannel instance
     */
    async startQueue(voiceChannel) {
        this.active = true;

        return await this.continueQueue(voiceChannel);
    }

    /**
     * This method dynamically updates the active music player embed, calling this will update the embed based on the most recent internal checks
     */
    updateSongState() {
        this.songState = {
            footer: 'Repeat: Off',
            color: '#32cd32'
        };

        if (this.queue.active() == null) {
            this.songState.footer = 'Song has been removed and repeat has been disabled.';
        }
        else if ((this.queue.active()).repeat) {
            this.songState.footer = 'Repeat: On';
            this.songState.color = '#cccccc';
        }

        if (this.queue.repeat && this.queue.active() && !(this.queue.active()).repeat) {
            this.songState.footer += ' | Playlist repeat: On';
        }

        if (this.paused) {
            this.songState.footer = `Paused | ${this.songState.footer}`;
            this.songState.color = '#dd153d';
        }
    }
}

module.exports = MusicSystem;
