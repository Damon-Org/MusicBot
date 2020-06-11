const BaseCommand = require('../../structs/base_command.js');

/**
 * @category Commands
 * @extends BaseCommand
 */
class ResetPrefix extends BaseCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(ResetPrefix, {
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
            permissions: {
                logic: 'OR',
                levels: [
                    {
                        type: 'server',
                        name: 'MANAGE_CHANNELS'
                    }
                ]
            },
            example: 'reset prefix'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        const prefix = this.db.commandRegistrar.default_prefix;

        this.serverInstance.setPrefix(prefix);

        this.textChannel.send(`The command prefix for **Damon Music** has been reset to the default prefix \`${prefix}\``).then(msg => msg.pin());
    }
}

module.exports = ResetPrefix;
