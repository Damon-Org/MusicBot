const BasicCommand = require('../../util/basic_command.js');

/**
 * @category Commands
 * @extends Command
 */
class ResetPrefix extends BasicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
            category: category,

            name: 'reset prefix',
            aliases: [
                'remove prefix',
                'resetprefix'
            ],
            description: 'Reset the prefix to the default value.',
            usage: 'reset prefix',
            params: [],
            permission: {
                type: 'server',
                name: 'MANAGE_CHANNELS'
            },
            examples: [
                'reset prefix'
            ]
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        const prefix = this.db.config.development ? this.db.config.default_prefix.dev : this.db.config.default_prefix.prod;

        this.serverInstance.setPrefix(prefix);

        const newMsg = await this.textChannel.send(`The command prefix for **Damon Music** has been reset to the default prefix \`${prefix}\``);
        newMsg.pin();
    }
}

module.exports = ResetPrefix;
