const BaseCommand = require('../../structs/base_command.js');

/**
 * @category Commands
 * @extends Command
 */
class ResetPrefix extends BaseCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
            category: category,
            guild_only: true,

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
            example: 'reset prefix'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        const prefix = this.db.commandRegisterer.default_prefix;

        this.serverInstance.setPrefix(prefix);

        const newMsg = await this.textChannel.send(`The command prefix for **Damon Music** has been reset to the default prefix \`${prefix}\``);
        newMsg.pin();
    }
}

module.exports = ResetPrefix;
