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
        const
            oldPrefix = await this.serverInstance.getPrefix(),
            newPrefix = this.db.commandRegistrar.default_prefix;

        if (oldPrefix == newPrefix) {
            this.textChannel.send('There\'s no custom prefix to reset.');

            return true;
        }

        this.db.lazyLoader.set(this.serverInstance.id, 'prefix', newPrefix);
        this.serverInstance.prefix = null;

        this.serverUtils.deleteGuildOption(this.serverInstance.id, 'guildPrefix');

        this.send(`The command prefix for **Damon Music** has been reset to the default prefix \`${newPrefix}\``)
            .then(msg => msg.pin());

        return true;
    }
}

module.exports = ResetPrefix;
