module.exports = class ResetPrefix {
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
        const
            server = musicBot.serverUtils.getClassInstance(msgObj.guild.id),
            serverMember = msgObj.member;

        if (!serverMember.hasPermission(musicBot.Discord.Permissions.FLAGS.MANAGE_CHANNELS, false, true, true)) {
            const newMsg = await msgObj.reply('you do not have permission to change the bot prefix of this server.\nYou need the `MANAGE_CHANNELS` permission.');
            newMsg.delete({timeout: 5000});

            return;
        }

        await musicBot.serverUtils.updateGuildOption(msgObj.guild.id, 'guildPrefix', musicBot.config.default_prefix);
        server.setPrefix(musicBot.config.default_prefix);

        const newMsg = await msgObj.channel.send(`The command prefix for **Damon Music** has been reset to the default prefix \`${musicBot.config.default_prefix}\``);
        newMsg.pin();
    }
}
