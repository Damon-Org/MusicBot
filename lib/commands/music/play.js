module.exports = class Play {
    constructor() {

    }

    /**
     * @param {MusicBot} musicBot MusicBot instance
     * @param {Discord.Message} msgObj Discord.js Message Class instance
     * @param {string} command string representing what triggered the command
     * @param {string[]} args array of string arguments
     */
    onCommand(musicBot, msgObj, command, args) {
        const serverMember = msgObj.member;
        if (!serverMember) {
            msgObj.reply(`Music commands are not supported in Direct Messages.`);
            return;
        }

        const voiceChannel = msgObj.member.voiceChannel;
        if (!voiceChannel) {
            msgObj.reply(`you aren't a in voicechannel, join one to use this command.`);
            return;
        }

        const
            musicUtils = musicBot.musicUtils,
            [valid, url] = musicUtils.isValidDomain(args[0]);
        if (valid) {
            return;
        }

        console.log(url);
    }
}
