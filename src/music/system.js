const
    Queue = require('./queue.js'),
    Track = require('./track.js');

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

        this.reset();
    }

    get node() {
        return this.musicBot.carrier.getNode();
    }

    /**
     * Adds a song to the queue together with its requester
     * @param {external:Object} data Data found by the LavaLink REST APi
     * @param {external:Discord_GuildMember} serverMember A Discord.GuildMember instance
     * @param {external:Boolean} exception If the song should be played next up or handled normally
     */
    addToQueue(data, requester, exception = false) {
        const track = new Track(data);
        track.setRequester(requester);

        if (exception) {
            this.queue.addOnPosition(track, 2);

            return;
        }

        this.queue.add(track);
    }

    /**
     * Will pass on to the next song
     * @param {external:Discord_VoiceChannel} voiceChannel A Discord.VoiceChannel instance
     */
    async continueQueue(voiceChannel = null) {
        this.doNotSkip = false;

        if (await this.playSong(voiceChannel)) {
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

        const
            track = this.queue.active(),
            richEmbed = new this.musicBot.Discord.MessageEmbed()
                .setAuthor(track.author)
                .setTitle(track.getTitle())
                .setColor(this.songState.color)
                .setDescription(`Requested by: **${track.requester}**`)
                .setFooter(this.songState.footer);

        const
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
    createQueue(data, requester, textChannel) {
        this.startTime = Date.now();

        this.channel = textChannel;

        const track = new Track(data);
        track.setRequester(requester);

        this.addToQueue(data, requester);
    }

    /**
     * Will disable the last musicPlayer of our bot
     */
    disableOldPlayer() {
        if (this.lastMsg && !this.lastMsg.deleted) {
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

    /**
     * Checks if our bot is in the channel of that user doing the request if not return false
     * @param {external:Discord_VoiceChannel} voiceChannel A Discord.VoiceChannel instance
     * @returns {external:Boolean} True if Damon is in a voiceChannel, false if not
     */
    isDamonInVC(voiceChannel) {
        if (voiceChannel.members.get(this.client.user.id)) {
            return true;
        }

        return false;
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

        const data = await this.node.rest.resolve(`https://youtube.com/watch?v=${videoId}`);

        if (!voicechannel.members.get(user.id)) {
            const newMsg = await msgObj.channel.send(`${requester}, you've left your original voicechannel, request ignored.`);

            newMsg.delete({timeout: 5000});
            msgObj.delete();

            return;
        }

        this.musicBot.musicUtils.handleSongData(data, requester, msgObj, voicechannel, choiceInstance.shouldPlayNext);

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

            // Request was declined
            const data = await this.node.rest.resolve(`https://youtube.com/watch?v=${playlistObj.videoId}`);
            if (!data) {
                const richEmbed = new this.musicBot.Discord.MessageEmbed()
                    .setTitle('No results returned.')
                    .setDescription(`I could not find the track you requested or access to this track is limited.\nPlease try again with something other than what you tried to search for.`)
                    .setColor('#ed4337');

                msgObj.channel.send(richEmbed);

                return;
            }

            this.musicBot.musicUtils.handleSongData(data, serverMember, msgObj, voicechannel, exception);

            return;
        }

        playlistObj.playlist.forEach(async (song) => {
            await this.musicBot.musicUtils.handleSongData(song, serverMember, msgObj, voicechannel, exception, false);
        });
        msgObj.channel.send('Successfully added playlist!');
    }

    nodeError(error) {
        this.reset();
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
            //this.timer.pause();

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
        this.disableOldPlayer();

        this.paused = false;

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

            this.channel.send(`Queue has been concluded and bot has left the voicechannel.`);
            this.player.disconnect();
            this.reset();

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
    playPrevious() {
        this.doNotSkip = true;

        if (this.queue.active() == null) {
            // Remove the current active song
            this.queue.remove(null);

            this.queue.unshift(null);

            this.player.stopTrack();
        }
        else if ((this.queue.active()).repeat) {
            (this.queue.active()).repeat = false;
        }

        if (this.queue.getFromPosition(-1) != null) {
            this.queue.unshift(null);

            this.player.stopTrack();

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
        if (!this.player) {
            if (!voiceChannel) {
                this.channel.send(`Internal music error occured, function was called without VoiceChannel while one was required`);

                this.reset();

                return false;
            }

            if (voiceChannel.full) {
                const richEmbed = new this.musicBot.Discord.MessageEmbed()
                        .setTitle('Channel Full')
                        .setColor('#ff0033')
                        .setDescription('Voicechannel is full, try kicking someone or make the voicechannel size larger.');

                this.channel.send(richEmbed);

                this.reset();
                return false;
            }

            if (!voiceChannel.joinable) {
                const richEmbed = new this.musicBot.Discord.MessageEmbed()
                    .setTitle('Insufficient permissions')
                    .setColor('#ff0033')
                    .setDescription('I do not have permission to join your channel.');

                this.channel.send(richEmbed);

                this.reset();
                return false;
            }

            this.player = await this.node.joinVoiceChannel({
                guildID: voiceChannel.guild.id,
                voiceChannelID: voiceChannel.id
            });

            this.voiceChannel = voiceChannel;
        }

        const currentSong = this.queue.active();

        await this.player.playTrack(currentSong.track);
        this.player.setVolume(this.volume);

        this.player.once('end', (end) => this.soundEnd(end));

        //this.player.on('closed', () => this.soundEnd(end));
        this.player.on('error', (error) => this.nodeError(error));
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

        if (queueRepeat) {
            this.queue.repeat = false;

            return false;
        }

        this.queue.repeat = true;

        return true;
    }

    /**
     * Repeat toggle for the command
     * @returns {external:Boolean}
     */
    repeatToggle() {
        const
            songRepeat = (this.queue.active()).repeat,
            embedUtils = this.musicBot.embedUtils;

        if (!songRepeat) {
            (this.queue.active()).repeat = true;

            embedUtils.editEmbed(this.lastMsg, {
                color: this.songState.color,
                footer: {
                    text: this.songState.footer
                }
            });

            return true;
        }

        (this.queue.active()).repeat = false;

        this.updateSongState();

        embedUtils.editEmbed(this.lastMsg, {
            color: this.songState.color,
            footer: {
                text: this.songState.footer
            }
        });

        return false;
    }

    /**
     * Will reset all variables so our system is ready for a request
     */
    reset() {
        if (this.stream && !this.stream.ended) {
            this.stream.end('eventTriggerIgnore');
        }

        this.disableOldPlayer();

        this.queue.reset();

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
         * @type {external:ShoukakuPlayer}
         */
        this.player = null;
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
         * @type {*}
         * @deprecated
         */
        this.timer  = null;
        /**
         * @type {external:Number}
         */
        this.volume = 15;

        this.updateSongState();
    }

    /**
     * Resumes the music
     */
    resumePlayback() {
        if (this.paused) {
            this.player.setPaused(false);
            //this.timer.resume();

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
    skipTo(queueNumber) {
        if (queueNumber == 1) return true;
        if (isNaN(queueNumber) || queueNumber < -this.queue.maxPrequeue || queueNumber == 0) return false;

        queueNumber = parseInt(queueNumber);

        if (!this.queue.hasOnPosition(queueNumber)) return false;

        const loopCount = queueNumber < 0 ? (queueNumber*-1 + 1) : queueNumber - 2;

        for (let i = 0; i < loopCount; i++) {
            if (queueNumber < 0) this.queue.unshift(null);
            else this.queue.shift(null);
        }

        this.player.stopTrack();

        return true;
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
        if (end == 'eventTriggerIgnore') {
            return;
        }

        this.playNext();
    }

    /**
     * Will start the queue in the given voicechannel
     * @param {external:Discord_VoiceChannel} voiceChannel A Discord.VoiceChannel instance
     */
    async startQueue(voiceChannel) {
        this.active = true;

        return await this.continueQueue(voiceChannel);
    }
}

module.exports = MusicSystem;
