const
    Playlist = require('./playlist.js'),
    Queue = require('./queue.js');

module.exports = class MusicSystem {
    /**
     * @constructs
     * @param {MusicBot} musicBot A MusicBot Instance
     * @param {Server} serverInstance A Server Instance
     */
    constructor(musicBot, serverInstance) {
        this.musicBot = musicBot;
        this.parent = serverInstance;

        this.client = this.musicBot.client;
        this.queue = new Queue();

        this.reset();
    }

    /**
     * Adds a song to the queue together with its requester
     * @param {Song} song A Song instance
     * @param {Discord.GuildMember} serverMember A Discord.GuildMember instance
     */
    async addToQueue(song, exception = false) {
        await song.updateInformation();

        if (exception) {
            this.queue.addSongInPosition(song, 2);

            return;
        }

        this.queue.add(song);
    }

    /**
     * Will pass on to the next song
     * @param {Discord.VoiceChannel} voiceChannel A Discord.VoiceChannel instance
     */
    continueQueue(voiceChannel = null) {
        this.createNewPlayer();

        this.playSong(voiceChannel);
    }

    /**
     * Will create a nice embed that looks like a player interface
     */
    async createNewPlayer() {
        const
            song = this.queue.active(),
            richEmbed = new this.musicBot.Discord.RichEmbed()
                .setAuthor(song.author.name, song.author.avatar, song.author.url)
                .setTitle(song.getOverflownTitle())
                .setColor('#32cd32')
                .setDescription(`Requested by: **${song.requester}**`)
                .setFooter(`Views: ${song.viewcount}`);

        const
            newMsg = await this.channel.send(richEmbed),
            emojis = ['⏮', '⏸', '⏭', '🔁'];

        this.lastMsg = newMsg;

        async function react() {
            for (let i = 0; i < emojis.length; i++) {
                try {
                    await newMsg.react(emojis[i]);
                } catch (e) { console.log(e); }
            }
        }

        react();
    }

    /**
     * Sets the dedicated TextChannel and then passes the Song to MusicSystem#AddToQueue
     * @param {Song} song A Song instance
     * @param {Discord.TextChannel} textChannel A Discord.TextChannel instance
     */
    async createQueue(song, textChannel) {
        this.channel = textChannel;

        await this.addToQueue(song);
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

            this.lastMsg.clearReactions()
            .catch(err => {
                this.channel.send(`Unknown error occured\nThis generated the following error: \`\`\`js\n${err.stack}\`\`\`Contact Yimura#9999 on Discord if this keeps occuring.`);
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
     * Will handle any action on MusicPlayer Reactions
     * @param {String} emoji A unicode string of the emoji
     * @param {Discord.Message} msgObj
     * @param {Discord.User} user
     */
    onMusicPlayerAction(emoji, msgObj, user) {
        if (this.lastMsg.id != msgObj.id || !this.voiceChannel.members.get(user.id)) {
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
                this.playNext();
                break;
            }
            case '🔁': {
                if (!this.playerRepeatToggle()) {
                    msgObj.channel.send('The currently playing song was removed and repeat has been disabled.');
                }
                break;
            }
        }
    }

    pausePlayback() {
        if (!this.paused) {
            this.stream.pause();
            //this.timer.pause();

            this.paused = true;

            let
                color = '#32cd32',
                footer = 'Repeat: Off';

            if (this.queue.active() == null) {
                footer = 'Song has been removed and repeat has been disabled';
                color = '#32cd32';
            }
            else if ((this.queue.active()).repeat) {
                footer = 'Repeat: On';
                color = '#cccccc';
            }

            const embedUtils = this.musicBot.embedUtils;

            embedUtils.editEmbed(this.lastMsg, {
                color: color,
                footer: {
                    text: footer
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
     * @param {Song} song A Song instance
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
        this.parent.playlists.add(serverMember.id, playlistObj);

        const emojis = ['✔', '✖'];
        for (let i = 0; i < emojis.length; i++) {
            if (newMsg.deleted) {
                return;
            }

            await newMsg.react(emojis[i]);
        }
    }

    /**
     * Will go through several checks of things that have to get updated before moving on to the next song
     */
    async playNext(doNotSkip = false) {
        if (!this.stream.ended) {
            this.stream.end('startingNextSong');
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

        if (this.queue.getSongFromPosition(2) == null) {
            if (this.queue.repeat) {
                await this.queue.repeat();

                this.continueQueue();
                return;
            }

            this.channel.send(`Queue has been concluded and bot has left the voicechannel.`);
            this.voiceChannel.leave();
            this.reset();

            return;
        }

        if (!doNotSkip) {
            this.queue.shift();
        }

        this.continueQueue();
    }

    /**
     * This will put the queue back to the previous song and then play the next song
     * @returns {Boolean} True on success, false when no more previous songs
     */
    playPrevious() {
        if (this.queue.active() == null) {
            // Remove the current active song
            this.queue.remove(null);

            this.queue.unshift(null);

            this.playNext(true);
        }
        else if ((this.queue.active()).repeat) {
            (this.queue.active()).repeat = true;
        }

        if (this.queue.getSongFromPosition(-1) != null) {
            this.queue.unshift(null);

            this.playNext(true);

            return true;
        }

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

        let
            footer = 'Repeat: On',
            color = '#cccccc';

        if (!songRepeat) {
            if (!queueRepeat) {
                (this.queue.active()).repeat = true;
            }
            else {
                (this.queue.active()).repeat = false;

                footer = 'Repeat: Off';
                color = '#32cd32';
            }
            this.queue.repeat = false;
        }
        else {
            this.queue.repeat = 1;
            (this.queue.active()).repeat = 0;

            footer = 'Playlist repeat: On';
            color = '#32cd32';
        }

        const embedUtils = this.musicBot.embedUtils;

        embedUtils.editEmbed(this.lastMsg, {
            color: color,
            footer: {
                text: footer
            }
        });
    }

    /**
     * @param {Discord.VoiceChannel} voiceChannel A Discord.VoiceChannel instance
     */
    async playSong(voiceChannel = null) {
        if (!this.conn) {
            if (!voiceChannel) {
                this.channel.send(`Internal music error occured, function was called without VoiceChannel while one was required`);

                this.reset();

                return;
            }

            if (voiceChannel.full) {
                this.reset();

                const richEmbed = new this.musicBot.Discord.RichEmbed()
                        .setTitle('Channel Full')
                        .setColor('#ff0033')
                        .setDescription('Voicechannel is full, try kicking someone or make the voicechannel size larger.');

                this.channel.send(richEmbed);
                return;
            }

            if (!voiceChannel.joinable) {
                this.reset();

                const richEmbed = new this.musicBot.Discord.RichEmbed()
                    .setTitle('Insufficient permissions')
                    .setColor('#ff0033')
                    .setDescription('I do not have permission to join your channel.');

                this.channel.send(richEmbed);
                return;
            }

            this.conn = await voiceChannel.join();
            this.voiceChannel = voiceChannel;
        }

        const soundStream = await (this.queue.active()).getStream();
        this.stream = this.conn.playStream(soundStream);

        this.stream.ended = false;
        this.stream.setVolume(this.volume);

        this.stream.on('end', end => this.soundEnd(end));
    }

    /**
     * Will return true if a valid queue exists
     * @returns Boolean
     */
    queueExists() {
        if (this.active) {
            return true;
        }

        return false;
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

        let
            footer = 'Repeat: On',
            color = '#cccccc';

        if (!repeat) {
            (this.queue.active()).repeat = true;

            embedUtils.editEmbed(this.lastMsg, {
                color: color,
                footer: {
                    text: footer
                }
            });

            return true;
        }

        (this.queue.active()).repeat = false;

        footer = 'Repeat: Off';
        color = '#32cd32';

        embedUtils.editEmbed(this.lastMsg, {
            color: color,
            footer: {
                text: footer
            }
        });

        return false;
    }

    /**
     * Will reset all variables so our system is ready for a request
     */
    reset() {
        this.queue.reset();

        this.channel = null;
        this.lastMsg = null;

        this.active = false;
        this.paused = false;
        this.stream = null;
        this.timer  = null;
        this.volume = 0.15;
    }

    /**
     * Resumes the music
     */
    resumePlayback() {
        if (this.paused) {
            this.stream.resume();
            //this.timer.resume();

            this.paused = false;

            let
                color = '#32cd32',
                footer = 'Repeat: Off';

            if (this.queue.active() == null) {
                footer = 'Song has been removed and repeat has been disabled.';
                color = '#32cd32';
            }
            else if ((this.queue.active()).repeat) {
                footer = 'Repeat: On';
                color = '#cccccc';
            }

            const embedUtils = this.musicBot.embedUtils;

            embedUtils.editEmbed(this.lastMsg, {
                color: color,
                footer: {
                    text: footer
                }
            });
        }

        return;
    }

    /**
     * Sets the volume on the active stream
     * @param {Number} volume
     */
    setVolume(volume) {
        volume /= 100;

        if (this.volume == volume) {
            return false;
        }

        this.stream.setVolume(volume);
        this.volume = volume;

        return true;
    }

    /**
     * @param {String} end A string end reason
     */
    soundEnd(end) {
        if (end == 'startingNextSong') {
            return;
        }

        this.stream.ended = true;

        console.log(end);

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
