const BasicCommand = require('../../util/basic_command.js');

/**
 * This command is limited to admin's of the highest permission level or the owner
 * It will lock the bot from being used by anyone but the administrator
 * @category Commands
 * @extends Command
 */
class CallLink extends BasicCommand {
    /**
     * @param {Array<*>} args
     */
    constructor(...args) {
        super(...args);
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async onCommand(command) {
        const voicechannel = this.voiceChannel;
        if (!voicechannel) {
            const newMsg = await this.msgObj.reply('you aren\'t in a voicechannel');

            newMsg.delete({timeout: 5000});

            return;
        }

        const link = `https://discordapp.com/channels/${this.msgObj.guild.id}/${voicechannel.id}/`;
        this.msgObj.reply(`Here's the link to your voice channel: ${link}`);
    }
}

module.exports = CallLink;
