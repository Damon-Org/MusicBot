module.exports = class RemoveLock {
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
        const serverMember = msgObj.member;
        if (!serverMember) {
            msgObj.reply('RemoveLock does not work outside of guilds.');
            return;
        }

        // from here on we know that we're in a server chat
        const serverId = msgObj.guild.id;

        if (args.length < 1) {
            const newMsg = await msgObj.reply('removing channel lock takes at least 1 argument.');
            newMsg.delete(2500);

            return;
        }

        if (!serverMember.hasPermission(musicBot.Discord.Permissions.FLAGS.MANAGE_CHANNELS, false, true, true)) {
            const newMsg = await msgObj.reply('you do not have permission to remove channel lock features.\nYou need the `MANAGE_CHANNELS` permission.');
            newMsg.delete(2500);

            return;
        }

        const type = args[0];

        if (type == 'music') {
            await musicBot.serverUtils.updateGuildOption(serverId, 'lockMusicChannel', '');
            msgObj.reply(`channel lock has been disabled for ${type}.`);
            return;
        }

        msgObj.reply(`unknown category "${type}", try again with a valid category.`);
        return;
    }
}
