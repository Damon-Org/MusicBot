import BaseCommand from '../../structures/commands/BaseCommand.js'

const args = ['disable', 'enable'];

export default class Lock extends BaseCommand {
    /**
     * @param {String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(Lock, {
            category: category,
            guild_only: true,

            name: 'hints',
            aliases: [],
            description: 'Disable or enable hints whenever you want them to appear.',
            usage: 'hints <toggle>',
            params: [
                {
                    name: 'toggle',
                    description: 'Set the new state of hinting.',
                    type: 'string',
                    required: true
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
            example: 'hints disable'
        });
    }

    /**
     * @param {String} command string representing what triggered the command
     */
    async run(command) {
        if (!this.args[0] || !args.includes(this.args[0])) {
            this.send('Invalid argument given, please use `disable` or `enable`.')
                .then(msg => msg.delete({timeout: 5e3}));

            return true;
        }

        const guildId = this.server.id;
        const guildSettings = this.getModule('guildSetting');
        const state = guildSettings.get(guildId, 'hintsDisabled');
        if (!state && this.args[0] === 'disable') {
            guildSettings.set(guildId, 'hintsDisabled', true);
            this.server.options.update('hintsDisabled', true);
        }
        else if (state == true && this.args[0] === 'enable') {
            guildSettings.set(guildId, 'hintsDisabled', undefined);
            this.server.options.delete('hintsDisabled');
        }
        else {
            this.send(`No action taken, hints are already ${this.args[0]}d.`);

            return true;
        }

        this.send(`Hints have been ${this.args[0]}d.`);

        return true;
    }
}
