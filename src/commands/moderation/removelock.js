const BasicCommand = require('../../util/basic_command.js');

/**
 * @category Commands
 * @extends Command
 */
class RemoveLock extends BasicCommand {
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
        const type = this.args[0];

        if (type == 'music') {
            await this.serverUtils.updateGuildOption(serverId, 'lockMusicChannel', null);
            this.msgObj.reply(`channel lock has been disabled for ${type}.`);

            return;
        }

        this.msgObj.reply(`unknown category "${type}", try again with a valid category.`);
    }
}

module.exports = RemoveLock;
