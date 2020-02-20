const BasicCommand = require('../../util/basic_command.js');

/**
 * This command is limited to admin's of the highest permission level or the owner
 * It will lock the bot from being used by anyone but the administrator
 * @category Commands
 * @extends Command
 */
class LockDown extends BasicCommand {
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

    }
}

module.exports = LockDown;
