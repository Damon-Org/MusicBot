const Command = require('../../util/command.js');

/**
 * @category Commands
 * @extends Command
 */
class RemoveLock extends Command {
    /**
     * @param {Object} properties
     */
    constructor(properties) {
        super(properties);
    }

    /**
     * @param {MusicBot} musicBot MusicBot instance
     * @param {external:Discord_Message} msgObj Discord.js Message Class instance
     * @param {external:String} command string representing what triggered the command
     * @param {external:String[]} args array of string arguments
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
            newMsg.delete({timeout: 5000});

            return;
        }

        if (!serverMember.hasPermission(musicBot.Discord.Permissions.FLAGS.MANAGE_CHANNELS, false, true, true)) {
            const newMsg = await msgObj.reply('you do not have permission to remove channel lock features.\nYou need the `MANAGE_CHANNELS` permission.');
            newMsg.delete({timeout: 5000});

            return;
        }

        const type = args[0];

        if (type == 'music') {
            await musicBot.serverUtils.updateGuildOption(serverId, 'lockMusicChannel', null);
            msgObj.reply(`channel lock has been disabled for ${type}.`);
            return;
        }

        msgObj.reply(`unknown category "${type}", try again with a valid category.`);
        return;
    }
}

module.exports = RemoveLock;
