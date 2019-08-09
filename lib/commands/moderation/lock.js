module.exports = class Lock {
    constructor() {

    }

    /**
     * @param {MusicBot} musicBot MusicBot instance
     * @param {Message} msgObj Discord.js Message Class instance
     * @param {string} command string representing what triggered the command
     * @param {string[]} args array of string arguments
     */
    async onCommand(musicBot, msgObj, command, args) {
        const serverMember = msgObj.member;
        if (!serverMember) {
            msgObj.reply('lock does not work outside of guilds.');
            return;
        }

        if (!serverMember.hasPermission(Flag.MANAGE_CHANNELS, false, true, true)) {
            const newMsg = await msgObj.reply('you do not have permission to lock features to a specific channel.\nYou need the `MANAGE_CHANNELS` permission.');
            newMsg.delete(2500);

            return;
        }

        const
            channel = msgObj.mentions.channels.first(),
            type = args[0];

        if (type == 'music') {
            if (channel == undefined) {
                // UpdateGuildOption
                msgObj.reply('channel lock has been disabled!');
                return;
            }

            // UpdateGuildOption
        }
        else {
            msgObj.reply(`unknown category "${type}", try again with a valid category.`);
            return;
        }
    }
}
