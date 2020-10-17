import BaseCommand from '../../structures/commands/BaseCommand.js'

export default class SetPrefix extends BaseCommand {
    /**
     * @param {String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(SetPrefix, {
            category: category,
            guild_only: true,

            name: 'set prefix',
            aliases: [
                'setprefix',
                'changeprefix'
            ],
            description: 'Change the bot its prefix in your server.',
            usage: 'setprefix <new-prefix>',
            params: [
                {
                    name: 'new-prefix',
                    description: 'Changes the prefix to which Damon Music listens on in your server.',
                    type: 'string',
                    default: 'Resets the the custom prefix if one was set.'
                }
            ],
            permissions: {
                logic: 'OR',
                levels: [
                    {
                        type: 'server',
                        name: 'MANAGE_CHANNELS'
                    }
                ]
            },
            example: 'changeprefix b?'
        });
    }

    /**
     * @param {String} command string representing what triggered the command
     */
    async run(command) {
        const
            newPrefix = this.args[0],
            prefix = this.globalStorage.get('prefix');

        if (!newPrefix || newPrefix == prefix) {
            this.modules.guildSetting.set(this.server.id, 'prefix', newPrefix);
            this.server._prefix = null;
            this.server.options.delete('guildPrefix');

            this.send(`The command prefix for **Damon Music** has been reset to the default prefix \`${prefix}\``)
                .then(msg => msg.pin());

            return true;
        }

        if (/^[\x00-\x7F]*$/.test(newPrefix) && newPrefix.length <= 6) {
            const oldPrefix = this.server.prefix;

            this.server.prefix = newPrefix;

            this.send(`The command prefix for **Damon Music** has been changed in this server has been changed from \`${oldPrefix}\` to \`${newPrefix}\``)
                .then(msg => msg.pin());

            return true;
        }

        this.reply('new prefix is not a valid ASCII character or is longer than 6 characters, make sure you aren\'t using unicode or emoji\'s as a prefix.')
            .then(msg => msg.delete({timeout: 5e3}));

        return true;
    }
}
