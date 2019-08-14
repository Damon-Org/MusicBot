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

        this.queue = new Queue();

        this.channel = null;
        this.lastMsg = null;

        this.active = false;
        this.paused = false;
        this.stream = null;
        this.timer  = null;
        this.repeat = 0;
        this.volume = 0.15;
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
    continueQueue(voiceChannel) {
        this.playSong(voiceChannel);
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
     * Checks if our bot is in the channel of that user doing the request if not return false
     * @param {Discord.VoiceChannel} voiceChannel A Discord.VoiceChannel instance
     * @returns Boolean
     */
    isDamonInVC(voiceChannel) {
        if (voiceChannel.members.get(this.musicBot.client.user.id)) {
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
     * @param {Discord.VoiceChannel} voiceChannel A Discord.VoiceChannel instance
     */
    playSong(voiceChannel) {
        if (voiceChannel.full) {
            this.queue.reset();

            const
                msgChannel = this.bot.channels.get(this.servers[serverId].channel),
                embed = new RichEmbed()
                    .setTitle('Error 502')
                    .setColor('#ff0033')
                    .setDescription('Your voicechannel appears to be full, so I can\'t join 😢');

            return msgChannel.send(embed);
        }
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
     * Will start the queue in the given voicechannel
     * @param {Discord.VoiceChannel} voiceChannel A Discord.VoiceChannel instance
     */
    startQueue(voiceChannel) {
        this.continueQueue(voiceChannel);
    }
}
