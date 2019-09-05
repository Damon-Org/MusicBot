module.exports = class Pause {
    constructor() {

    }

    /**
     * @param {MusicBot} musicBot MusicBot instance
     * @param {Discord.Message} msgObj Discord.js Message Class instance
     * @param {string} command string representing what triggered the command
     * @param {string[]} args array of string arguments
     */
    async onCommand(musicBot, msgObj, command, args) {
        const voicechannel = msgObj.member.voicechannel;
        if (!voicechannel) {
            const newMsg = await msgObj.reply('you aren\'t in a voicechannel');

            newMsg.delete(3500);

            return;
        }

        const
            serverId = msgObj.guild.id,
            musicSystem = (musicBot.serverUtils.getClassInstance(serverId)).musicSystem;

        if (musicSystem.isDamonInVC(voicechannel)) {
            if (musicSystem.pausePlayback()) {
                msgObj.channel.send('Music playback has been paused.');

                return;
            }

            const newMsg = await msgObj.reply('music is already paused, use `resume` command to continue playing.');

            newMsg.delete(3500);

            return;
        }

        const newMsg = await msgObj.reply('you aren\'t in the bot\'s channel.');

        newMsg.delete(3500);
    }
}
