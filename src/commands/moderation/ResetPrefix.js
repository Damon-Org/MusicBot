import BaseCommand from '../../structures/commands/BaseCommand.js'

export default class ResetPrefix extends BaseCommand {
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
            oldPrefix = this.server.prefix,
            newPrefix = this.getModule('commandRegistrar').defaultPrefix;

        if (oldPrefix == newPrefix) {
            this.send('There\'s no custom prefix to reset.');

            return true;
        }

        this.getModule('guildSetting').set(this.server.id, 'prefix', newPrefix);
        this.server._prefix = null;
        this.server.options.delete('guildPrefix');

        this.send(`The command prefix for **Damon Music** has been reset to the default prefix \`${newPrefix}\``)
            .then(msg => msg.pin());

        return true;
    }
}
