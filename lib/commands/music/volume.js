module.exports = class Volume {
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
            if (args[0] == undefined || args[0].length == 0) {
                const newMsg = await msgObj.reply('please give a value, command format: `volume #number`.');

                newMsg.delete(3500);

                return;
            }

            if (isNaN(args[0]) || args[0].includes(',')) {
                const newMsg = await msgObj.reply('invalid volume level, make sure you give a number and that there\'s no `,` in that number.');

                newMsg.delete(5000);

                return;
            }

            const volume = parseInt(args[0], 10);

            if (volume < 10 || volume > 200) {
                const newMsg = await msgObj.reply('invalid volume level, please give a value between 10 and 200');

                newMsg.delete(3500);

                return;
            }

            if (musicSystem.setVolume(volume)) {
                msgObj.channel.send(`Volume level has been changed to \`${volume}\`.`);

                return;
            }

            const newMsg = await msgObj.reply('volume level unchanged.');

            newMsg.delete(3500);

            return;
        }

        const newMsg = await msgObj.reply('you aren\'t in the bot\'s channel.');

        newMsg.delete(3500);
    }
}
