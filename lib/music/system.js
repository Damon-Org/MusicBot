const
    Playlist = require('./playlist.js'),
    Queue = require('./queue.js'),
    Track = require('./track.js');

module.exports = class MusicSystem {
    /**
     * @constructs
     * @param {MusicBot} musicBot A MusicBot Instance
     * @param {Server} serverInstance A Server Instance
     */
    constructor(musicBot, serverInstance) {
        this.musicBot = musicBot;
        this.serverInstance = serverInstance;

        this.client = this.musicBot.client;
        this.queue = new Queue();

        this.reset();
    }

    get node() {
        return this.musicBot.carrier.getNode();
    }

    /**
     * Adds a song to the queue together with its requester
     * @param {Object} data Data found by the LavaLink REST APi
     * @param {Discord.GuildMember} serverMember A Discord.GuildMember instance
     * @param {Boolean} exception If the song should be played next up or handled normally
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
     * @param {Discord.VoiceChannel} voiceChannel A Discord.VoiceChannel instance
     */
    async continueQueue(voiceChannel = null) {
        await this.playSong(voiceChannel);

        this.createNewPlayer();
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
            await newMsg.react(emoji)
            .catch(e => {
                if (e.message != 'Unknown Message') {
                    console.log(e.stack);
                }
            });
        });
    }

    /**
     * Sets the dedicated TextChannel and then passes the Song to MusicSystem#AddToQueue
     * @param {Object} data Data found by the LavaLink REST APi
     * @param {Discord.GuildMember} requester
     * @param {Discord.TextChannel} textChannel A Discord.TextChannel instance
     */
    createQueue(data, requester, textChannel) {
        this.startTime = Date.now();

        this.channel = textChannel;

        const track = new Track(data);
        track.setRequester(requester);

        this.addToQueue(data, requester);

        return;
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
                this.channel.send(`Unknown error occured\nThis generated the following error: \`\`\`js\n${err.stack}\`\`\`Contact Yimura#6969 on Discord if this keeps occuring.`);
            });
        }
    }

    /**
     * Checks if our bot is in the channel of that user doing the request if not return false
     * @param {Discord.VoiceChannel} voiceChannel A Discord.VoiceChannel instance
     * @returns Boolean
     */
    isDamonInVC(voiceChannel) {
        if (voiceChannel.members.get(this.client.user.id)) {
            return true;
        }

        return false;
    }

    /**
     * @param {Number} index The index of the song in the Choice instance
     * @param {Discord.Messsage} msgObj
     * @param {Discord.User} user
     */
    async onChoiceEmbedAction(index, msgObj, user) {
        const choiceInstance = this.serverInstance.choices.get(user.id);

        if (choiceInstance == undefined || choiceInstance.listener.id != msgObj.id) {
            return;
        }

        if (index > 4) {
            msgObj.delete();

            return;
        }

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

        if (this.queueExists()) {
            if (!this.isDamonInVC(voicechannel)) {
                const newMsg = await msgObj.reply(`you aren't in the bot's channel.`);

                newMsg.delete({timeout: 5000});
                msgObj.delete();

                return;
            }

            msgObj.delete();
            this.serverInstance.choices.delete(user.id);

            const err = this.addToQueue(data, requester, choiceInstance.shouldPlayNext);
            if (err) {
                this.musicBot.error(err.stack);
                msgObj.channel.send(`The following error occured while trying to play this song:\`\`\`${err.stack}\`\`\``);

                return;
            }
            if (!choiceInstance.shouldPlayNext) {
                msgObj.channel.send(`Added song **${data.info.title}**`);

                return;
            }
            msgObj.channel.send(`Added song next up **${data.info.title}**`);

            return;
        }

        msgObj.delete();
        this.serverInstance.choices.delete(user.id);

        const err = this.createQueue(data, requester, msgObj.channel);
        if (err) {
            this.musicBot.error(err.stack);
            msgObj.channel.send(`The following error occured while trying to play this song:\`\`\`${err.stack}\`\`\``);

            this.reset();
            return;
        }
        this.startQueue(voicechannel);

        msgObj.channel.send(`Playback starting with **${data.info.title}**`);
    }

    nodeError(error) {

        this.reset();
    }

    /**
     * Will handle any action on MusicPlayer Reactions
     * @param {String} emoji A unicode string of the emoji
     * @param {Discord.Message} msgObj
     * @param {Discord.User} user
     */
    async onMusicPlayerAction(emoji, msgObj, user) {
        if (!this.lastMsg || this.lastMsg.id != msgObj.id || !this.voiceChannel.members.get(user.id)) {
            return;
        }

        switch (emoji) {
            case '⏮': {
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
     * Will create an embed of the list it found and ask the user if he just wants to add the song to the list or add all the songs from the selected playlist
     * @param {Discord.Message} msgObj A Discord.Message instance
     * @param {Discord.VoiceChannel} voiceChannel A Discord.VoiceChannel instance
     * @param {Object} data Data found by the LavaLink REST APi
     */
    async playlistEmbed(msgObj, voiceChannel, song) {
        const
            playlistId = song.list,
            serverMember = msgObj.member,
            playlistObj = {
                playlist: new Playlist(playlistId),
                origin: song,
                voiceChannel: voiceChannel
            };

        const richEmbed = new musicBot.Discord.RichEmbed()
            .setAuthor('Playlist detected.')
            .setColor('#252422')
            .setDescription(`I've detected that this song contains a playlist, do you wish to add this [playlist](https://youtube.com/playlist?list=${playlistId})?`)
            .setFooter('playlist_detected');

        const newMsg = await msgObj.channel.send(richEmbed);

        playlistObj.msgObj = newMsg;
        this.serverInstance.playlists.add(serverMember.id, playlistObj);

        const emojis = ['✔', '✖'];
        emojis.forEach(async emoji => {
            await newMsg.react(emoji)
            .catch(e => {
                if (e.message != 'Unknown Message') {
                    console.log(e.stack);
                }
            });
        });
    }

    /**
     * Will go through several checks of things that have to get updated before moving on to the next song
     */
    async playNext() {
        if (this.doNotSkip) {
            await this.player.stopTrack();
        }

        this.disableOldPlayer();

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
     * @param {Discord.VoiceChannel} voiceChannel A Discord.VoiceChannel instance
     */
    async playSong(voiceChannel = null) {
        if (!this.player) {
            if (!voiceChannel) {
                this.channel.send(`Internal music error occured, function was called without VoiceChannel while one was required`);

                this.reset();

                return;
            }

            if (voiceChannel.full) {
                this.reset();

                const richEmbed = new this.musicBot.Discord.MessageEmbed()
                        .setTitle('Channel Full')
                        .setColor('#ff0033')
                        .setDescription('Voicechannel is full, try kicking someone or make the voicechannel size larger.');

                this.channel.send(richEmbed);
                return;
            }

            if (!voiceChannel.joinable) {
                this.reset();

                const richEmbed = new this.musicBot.Discord.MessageEmbed()
                    .setTitle('Insufficient permissions')
                    .setColor('#ff0033')
                    .setDescription('I do not have permission to join your channel.');

                this.channel.send(richEmbed);
                return;
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
    }

    /**
     * Will return true if a valid queue exists
     * @returns Boolean
     */
    queueExists() {
        return this.active;
    }

    /**
     * @param {Number} queueNumber A number that exists in queue
     */
    removeSong(queueNumber) {
        if (!queueNumber || queueNumber == '' || queueNumber.length == 0) {
            queueNumber = 1;
        }

        if (isNaN(queueNumber) || queueNumber < -this.queue.maxPrequeue || queueNumber == 0) {
            return false;
        }

        return this.queue.removeOnPosition(queueNumber);
    }

    /**
     * Enables entire queue repeat
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
        this.disableOldPlayer();

        if (this.stream && !this.stream.ended) {
            this.stream.end('eventTriggerIgnore');
        }

        this.queue.reset();

        this.channel = null;
        this.lastMsg = null;

        this.doNotSkip = false;
        this.player = null;
        this.voiceChannel = null;

        this.active = false;
        this.paused = false;
        this.startTime = 0;
        this.stream = null;
        this.timer  = null;
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
     * @param {Number} volume
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
     * @param {String} end A string end reason
     */
    soundEnd(end) {
        if (end == 'eventTriggerIgnore') {
            return;
        }

        this.playNext();
    }

    /**
     * Will start the queue in the given voicechannel
     * @param {Discord.VoiceChannel} voiceChannel A Discord.VoiceChannel instance
     */
    startQueue(voiceChannel) {
        this.active = true;

        this.continueQueue(voiceChannel);
    }
}
