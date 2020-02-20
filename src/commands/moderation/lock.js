const BasicCommand = require('../../util/basic_command.js');

/**
 * @category Commands
 * @extends Command
 */
class Lock extends BasicCommand {
    /**
     * @param {Array<*>} args
     */
    constructor(...args) {
        super(...args);
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        const
            channel = this.msgObj.mentions.channels.first() || this.textChannel,
            type = this.args[0];

        if (type == 'music') {
            await this.serverUtils.updateGuildOption(this.serverInstance.id, 'lockMusicChannel', channel.id);

            this.msgObj.reply(`channel lock has been enabled for ${type} on channel ${channel}`);

            return;
        }

        this.msgObj.reply(`unknown category "${type}", try again with a valid category.`);
    }
}

module.exports = Lock;
