const
    LavaTrack = require('../music/track/lava'),
    SpotifyTrack = require('../music/track/spotify');

class MusicUtils {
    /**
     * @category Util
     * @param {MusicBot} musicBot MusicBot instance
     */
    constructor(musicBot) {
        /**
         * @type {MusicBot}
         */
        this.musicBot = musicBot;
    }

    /**
     * @param {Array<*>}
     */
    checkRequestType(args) {
        if (args.length > 1) {
            return -1;
        }

        if (args[0].includes('https://') || args[0].includes('http://')) {
            try {
                const url = new URL(args[0]);

                if (url.hostname == 'open.spotify.com') return 1;

                return 0;
            } catch (e) {
                return -1;
            }
        }
    }

    /**
     * Creates a new ChoiceEmbed embed
     * @param {external:Discord_Message} msgObj A Discord Message instance
     * @param {external:String} searchFor A string to search for in the Youtube API
     * @param {external:Discord_Message} noticeMsg
     * @param {external:Boolean} [exception=false] If the song should be added next up
     */
    async createNewChoiceEmbed(msgObj, searchFor, noticeMsg, exception = false) {
        const
            serverId = msgObj.guild.id,
            requester = msgObj.member,
            voicechannel = requester.voice.channel,
            serverInstance = this.musicBot.serverUtils.getClassInstance(serverId);

        (await noticeMsg).delete();

        if (serverInstance.musicSystem.queueExists() && !serverInstance.musicSystem.isDamonInVC(voicechannel)) {
            const newMsg = await msgObj.reply('you aren\'nt in my voice channel! 😣');

            newMsg.delete({timeout: 5500});
            msgObj.delete({timeout: 1500});

            return;
        }

        if (! await serverInstance.addChoice(requester, searchFor, exception)) {
            const richEmbed = new this.musicBot.Discord.MessageEmbed()
                .setTitle('I could not find the song you requested')
                .setDescription(`No results returned from ${searchFor}.`)
                .setColor('#ed4337');

            msgObj.channel.send(richEmbed);

            return;
        }

        const choice = serverInstance.choices.get(requester.user.id);

        const richEmbed = new this.musicBot.Discord.MessageEmbed()
            .setColor('#252422')
            .setDescription(choice.getDescription())
            .setFooter('Choose a song by clicking the matching reaction below');

        const newMsg = await msgObj.channel.send(richEmbed);
        choice.setListener(newMsg);
        choice.setVoiceChannel(voicechannel);

        // const emojis = ['\u0030\u20E3','\u0031\u20E3','\u0032\u20E3','\u0033\u20E3','\u0034\u20E3','\u0035\u20E3', '\u0036\u20E3','\u0037\u20E3','\u0038\u20E3','\u0039\u20E3'];
        const emojis = ['\u0031\u20E3','\u0032\u20E3','\u0033\u20E3','\u0034\u20E3','\u0035\u20E3', '🚫'];
        // Custom for loop that interprets discord's trash delay
        emojis.forEach(async (emoji) => {
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
     * Creates an embed asking if the user would like to add the detected playlist or not
     * @param {external:String} origVideoId The original videoId
     * @param {external:Object[]} data The fetched playlist
     * @param {external:Discord_Message} msgObj
     * @param {external:Discord_Message} noticeMsg
     * @param {external:Boolean} exception The serverMember that made the request
     */
    async createPlaylistFoundEmbed(origVideoId, data, msgObj, noticeMsg, exception = false) {
        const
            serverInstance = this.musicBot.serverUtils.getClassInstance(msgObj.member.guild.id),
            playlistObj = {
                exception: false,
                playlist: data,
                requester: msgObj.member,
                videoId: origVideoId,
                voicechannel: msgObj.member.voice.channel
            };

        const richEmbed = new this.musicBot.Discord.MessageEmbed()
            .setAuthor('Playlist detected.')
            .setColor('#252422')
            .setDescription(`I\'ve detected that this song contains a playlist,\nare you sure you want to add **${data.length}** songs?\n\nBy confirming you agree that all songs will be added till the queue limit is hit.\nIf you decline only the original song will be added, if the playlist link does not contain a YouTube video then nothing will be added to the queue.\n\n**Keep in mind that the playlist will be added from the beginning.**`)
            .setFooter(`playlist_detected for https://youtu.be/${origVideoId}`);

        let newMsg = msgObj.reply(richEmbed);
        noticeMsg.then(msg => msg.delete());
        newMsg = await newMsg;

        playlistObj.msgObj = newMsg;
        serverInstance.playlists.set(msgObj.author.id, playlistObj);

        const emojis = ['✅', '❎'];
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
     * Helper function which handles a repetitive task
     * @param {external:*} track Track of any kind
     * @param {external:Discord_GuildMember} serverMember The guild member that made the request
     * @param {external:Discord_Message} msgObj The original message that triggered the request
     * @param {external:Discord_VoiceChannel} voiceChannel The voicechannel connected to the request
     * @param {external:Discord_Message} noticeMsg The message that says "Looking up your request"
     * @param {external:Boolean} exception If the song should be added next up
     * @param {external:Boolean} allowSpam ONLY set this param when adding a playlist
     * @returns {external:Boolean} Returns true upon success, false on failure => all actions should be stopped
     */
    async handleSongData(track, serverMember, msgObj, voiceChannel, noticeMsg = null, exception = false, allowSpam = true) {
        const musicSystem = (this.musicBot.serverUtils.getClassInstance(serverMember.guild.id)).musicSystem;
        if (noticeMsg) noticeMsg.then(msg => msg.delete());

        if (musicSystem.shutdown.type() == 'leave') musicSystem.reset();

        if (musicSystem.queueExists()) {
            if (musicSystem.isDamonInVC(voiceChannel) || !allowSpam) {
                if (!musicSystem.addToQueue(track, serverMember, exception)) {
                    msgObj.channel.send(`The queue is full, this server is limited to ${musicSystem.queue.maxLength} tracks.`)
                        .then(msg => msg.delete({timeout: 5e3}));

                    return false;
                }

                if (allowSpam) msgObj.channel.send(exception ? `Added song *next up* **${track.title}**` : `Added song **${track.title}**`);

                return true;
            }
            msgObj.reply('you aren\'nt in my voice channel! 😣').then(msg => msg.delete({timeout: 5e3}));

            return false;
        }
        await musicSystem.createQueue(track, serverMember, msgObj.channel);

        if (await musicSystem.startQueue(voiceChannel) && allowSpam) {
            msgObj.channel.send(`Playback starting with **${track.title}**`);
        }
        return true;
    }
}

module.exports = MusicUtils;
