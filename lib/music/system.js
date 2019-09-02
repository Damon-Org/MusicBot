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
    async addToQueue(song) {
        await song.updateInformation();

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

        if (this.queue.repeat) {
            this.continueQueue();

            return;
        }

        if (this.queue.getSongFromPosition(2) == null) {
            if (this.repeat) {
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
     * Will reset all varaibles so our system is ready for a request
     */
    reset() {
        this.queue.reset();

        this.channel = null;
        this.lastMsg = null;

        this.active = false;
        this.paused = false;
        this.stream = null;
        this.timer  = null;
        this.repeat = false;
        this.volume = 0.15;
    }

    /**
     * @param {String} end A string end reason
     */
    soundEnd(end) {
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
