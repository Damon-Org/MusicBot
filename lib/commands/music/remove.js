module.exports = class Remove {
    constructor() {

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
            if (musicSystem.removeSong(args[0])) {
                if (args[0] == 1) {
                    msgObj.reply('the currently playing song has been removed.');

                    return;
                }

                msgObj.reply('the selected song has been removed.');

                return;
            }

            const newMsg = await msgObj.reply('invalid song number. \nThe number of the song has to exist in queue, check queue with !q <# page number>.');

            newMsg.delete(5000);

            return;
        }

        const newMsg = await msgObj.reply('you aren\'t in the bot\'s channel.');

        newMsg.delete(3500);
    }
}
