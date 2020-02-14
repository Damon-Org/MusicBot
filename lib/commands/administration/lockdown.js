const Command = require('../../util/command.js');

/**
 * This command is limited to admin's of the highest permission level or the owner
 * It will lock the bot from being used by anyone but the administrator
 * @category Commands
 * @extends Command
 */
class LockDown extends Command {
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

    }
}

module.exports = LockDown;
