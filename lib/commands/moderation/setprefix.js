const Command = require('../../util/command.js');

class SetPrefix extends Command {
    /**
     * @param {Object} properties
     */
    constructor(properties) {
        super(properties);
    }

    /**
     * @param {MusicBot} musicBot MusicBot instance
     * @param {Discord.Message} msgObj Discord.js Message Class instance
     * @param {String} command string representing what triggered the command
     * @param {String[]} args array of string arguments
     */
    async onCommand(musicBot, msgObj, command, args) {
        const
            server = musicBot.serverUtils.getClassInstance(msgObj.guild.id),
            serverMember = msgObj.member;

        if (!serverMember.hasPermission(musicBot.Discord.Permissions.FLAGS.MANAGE_CHANNELS, false, true, true)) {
            const newMsg = await msgObj.reply('you do not have permission to change the bot prefix of this server.\nYou need the `MANAGE_CHANNELS` permission.');
            newMsg.delete({timeout: 5000});

            return;
        }

        const newPrefix = args[0];

        if (/^[\x00-\x7F]*$/.test(newPrefix) && newPrefix.length <= 4) {
            const oldPrefix = await server.getPrefix();

            server.setPrefix(newPrefix);

            const newMsg = await msgObj.channel.send(`The command prefix for **Damon Music** has been changed in this server has been changed from \`${oldPrefix}\` to \`${newPrefix}\``);
            newMsg.pin();

            return;
        }

        const newMsg = await msgObj.reply('new prefix is not a valid ASCII character or is longer than 4 characters, make sure you aren\'t using unicode or emoji\'s as a prefix.');
        newMsg.delete({timeout: 5000});
    }
}

module.exports = SetPrefix;
