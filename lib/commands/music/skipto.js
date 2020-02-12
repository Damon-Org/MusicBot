module.exports = class SkipTo {
    /**
     * @param {Object} properties
     */
    constructor(properties) {
        Object.assign(this, properties);
    }

    /**
     * @param {MusicBot} musicBot MusicBot instance
     * @param {Discord.Message} msgObj Discord.js Message Class instance
     * @param {String} command string representing what triggered the command
     * @param {String[]} args array of string arguments
     */
    async onCommand(musicBot, msgObj, command, args) {
        const voicechannel = msgObj.member.voice.channel;
        if (!voicechannel) {
            const newMsg = await msgObj.reply('you aren\'t in a voicechannel');

            newMsg.delete({timeout: 5000});

            return;
        }

        const
            serverId = msgObj.guild.id,
            serverInstance = musicBot.serverUtils.getClassInstance(serverId),
            musicSystem = serverInstance.musicSystem;

        if (musicSystem.isDamonInVC(voicechannel)) {
            if (musicSystem.skipTo(args[0])) {
                if (args[0] == 1) {
                    msgObj.reply('skipping to the currently playing song does nothing.');

                    return;
                }

                msgObj.reply(`successfully skipped to the selected song.`);

                return;
            }

            const newMsg = await msgObj.reply(`invalid song number. \nThe number of the song has to exist in queue, check queue with ${serverInstance.prefix}q <# page number>.`);

            newMsg.delete({timeout: 5000});

            return;
        }

        const newMsg = await msgObj.reply('you aren\'t in the bot\'s channel.');

        newMsg.delete({timeout: 5000});
    }
}