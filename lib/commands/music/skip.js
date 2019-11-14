module.exports = class Skip {
    /**
     * @param {Object} properties
     */
    constructor(properties) {
        Object.assign(this, properties);
    }

    /**
     * @param {MusicBot} musicBot MusicBot instance
     * @param {Discord.Message} msgObj Discord.js Message Class instance
     * @param {string} command string representing what triggered the command
     * @param {string[]} args array of string arguments
     */
    async onCommand(musicBot, msgObj, command, args) {
        const voicechannel = msgObj.member.voiceChannel;
        if (!voicechannel) {
            const newMsg = await msgObj.reply('you aren\'t in a voicechannel');

            newMsg.delete(3500);

            return;
        }

        const
            serverId = msgObj.guild.id,
            musicSystem = (musicBot.serverUtils.getClassInstance(serverId)).musicSystem;

        if (musicSystem.isDamonInVC(voicechannel)) {
            musicSystem.playNext();

            return;
        }

        const newMsg = await msgObj.reply('you aren\'t in the bot\'s channel.');

        newMsg.delete(3500);
    }
}
