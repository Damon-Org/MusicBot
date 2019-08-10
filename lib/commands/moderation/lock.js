module.exports = class Lock {
    constructor() {

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
            msgObj.reply('Lock does not work outside of guilds.');
            return;
        }

        // from here on we know that we're in a server chat
        const serverId = msgObj.guild.id;

        if (args.length < 1) {
            const newMsg = await msgObj.reply('channel lock at least requires 1 argument.');
            newMsg.delete(2500);

            return;
        }

        if (!serverMember.hasPermission(musicBot.Discord.Permissions.FLAGS.MANAGE_CHANNELS, false, true, true)) {
            const newMsg = await msgObj.reply('you do not have permission to lock features to a specific channel.\nYou need the `MANAGE_CHANNELS` permission.');
            newMsg.delete(2500);

            return;
        }

        const
            channel = msgObj.mentions.channels.first(),
            type = args[0];

        if (type == 'music') {
            if (channel == undefined) {
                await musicBot.serverUtils.updateGuildOption(serverId, 'lockMusicChannel', '');
                msgObj.reply('channel lock has been disabled!');
                return;
            }

            await musicBot.serverUtils.updateGuildOption(serverId, 'lockMusicChannel', channel.id);
            msgObj.reply(`channel lock has been enabled for ${type} on channel ${channel}`);
            return;
        }

        msgObj.reply(`unknown category "${type}", try again with a valid category.`);
        return;
    }
}
