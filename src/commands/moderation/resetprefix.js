const BasicCommand = require('../../util/basic_command.js');

/**
 * @category Commands
 * @extends Command
 */
class ResetPrefix extends BasicCommand {
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
        const prefix = this.musicBot.config.development ? this.musicBot.config.default_prefix.dev : this.musicBot.config.default_prefix.prod;

        this.serverInstance.setPrefix(prefix);

        const newMsg = await this.textChannel.send(`The command prefix for **Damon Music** has been reset to the default prefix \`${prefix}\``);
        newMsg.pin();
    }
}

module.exports = ResetPrefix;
