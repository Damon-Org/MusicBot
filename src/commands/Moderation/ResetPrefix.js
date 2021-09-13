import BaseCommand from '@/src/structures/commands/BaseCommand.js'

export default class ResetPrefix extends BaseCommand {
    /**
     * @param {string} category
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
     * @param {string} command string representing what triggered the command
     */
    async run(command) {
        const
            oldPrefix = this.server.settings.data.prefix,
            prefix = this.globalStorage.get('prefix');

        if (oldPrefix == prefix) {
            this.send('There\'s no custom prefix to reset.');

            return true;
        }

        await this.server.settings.update({ prefix });

        this.send(`The command prefix for **Damon Music** has been reset to the default prefix \`${prefix}\``)
            .then(msg => msg.pin());

        return true;
    }
}
