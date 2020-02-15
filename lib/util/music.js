class MusicUtils {
    /**
     * @category Util
     * @param {MusicBot} musicBot MusicBot instance
     */
    constructor(musicBot) {
        this.musicBot = musicBot;
    }

    /**
     * @param {Song} song A Song instance
     */
    async checkBrokenSong(song) {
        // Wil return true no matter what as the api is not setup yet
        return true;
    }

    /**
     * Creates a new ChoiceEmbed embed
     * @param {Discord.Message} msgObj A Discord Message instance
     * @param {String} searchFor A string to search for in the Youtube API
     * @param {Boolean} [exception=false] If the song should be added next up
     */
    async createNewChoiceEmbed(msgObj, searchFor, exception = false) {
        const
            serverId = msgObj.guild.id,
            requester = msgObj.member,
            voicechannel = requester.voice.channel,
            serverInstance = this.musicBot.serverUtils.getClassInstance(serverId);

        if (serverInstance.musicSystem.queueExists() && !serverInstance.musicSystem.isDamonInVC(voicechannel)) {
            const newMsg = await msgObj.reply(`you aren't in the bot's channel.`);

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
     * @param {String} origVideoId The original videoId
     * @param {Array} data The fetched playlist
     * @param {Discord.Message} msgObj
     * @param {Boolean} exception The serverMember that made the request
     */
    async createPlaylistFoundEmbed(origVideoId, data, msgObj, exception = false) {
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

        const newMsg = await msgObj.channel.send(`${msgObj.member}`, richEmbed);

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
     * @param {Object} data Data found by the LavaLink REST APi
     * @param {Discord.GuildMember} serverMember
     * @param {Discord.Message} msgObj
     * @param {Discord.VoiceChannel} voicechannel
     * @param {Boolean} exception If the song should be added next up
     * @param {Boolean} allowSpam ONLY set this param when adding a playlist
     */
    async handleSongData(data, serverMember, msgObj, voicechannel, exception = false, allowSpam = true) {
        const musicSystem = (this.musicBot.serverUtils.getClassInstance(serverMember.guild.id)).musicSystem;

        if (musicSystem.queueExists()) {
            if (musicSystem.isDamonInVC(voicechannel) || !allowSpam) {
                musicSystem.addToQueue(data, serverMember, exception);

                if (allowSpam) msgObj.channel.send(exception ? `Added song *next up* **${data.info.title}**` : `Added song **${data.info.title}**`);

                return;
            }

            const newMsg = await msgObj.reply(`you aren't in the bot's channel.`);

            newMsg.delete({timeout: 5000});

            return;
        }

        musicSystem.createQueue(data, serverMember, msgObj.channel);

        if (await musicSystem.startQueue(voicechannel) && allowSpam) {
            msgObj.channel.send(`Playback starting with **${data.info.title}**`);
        }
    }
}

module.exports = MusicUtils;
