module.exports = class MusicUtils {
    /**
     * @constructs
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
     * @param {Boolean} exception If the song should be added next up
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
        for (let i = 0; i < emojis.length; i++) {
            await newMsg.react(emojis[i])
            .catch(e => {
                if (e.message != 'Unknown Message') {
                    console.log(e.stack);
                }
            });
        }
    }
}
