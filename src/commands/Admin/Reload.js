import AdministratorCommand from '@/src/structures/commands/AdministratorCommand.js'

export default class Reload extends AdministratorCommand {
    /**
     * @param {string} category
     * @param {Main} main
     */
    constructor(category, main) {
        super(main);

        this.register(Reload, {
            category: category,
            hidden: true,

            name: 'reload',
            aliases: [],
            description: 'Reload commands.',
            usage: 'reload [target]',
            params: [
                {
                    name: 'target',
                    description: 'The specific part that should be.',
                    type: 'string',
                    default: 'Full reload of all modules and commands.'
                }
            ],
            example: ''
        });
    }

    get admin_level() {
        return 3;
    }

    /**
     * @param {string} trigger string representing what triggered the command
     */
    async run(trigger) {
        const reloadLevel = this.args[0];

        const response = await this.ws.sendEvent('RELOAD', 'GROUP', 'self', { target: reloadLevel ? reloadLevel : 'full' }, true, 3e3);

        if (!response.timeout && response.length === this._m.shard.count) {
            this.send('The reload has been executed successfully!');

            return true;
        }
        this.send(`**${response.length}** of the **${this._m.shard.count}** Shards responded with the remaining shards timing out. If retrying doesn't solve the issue, please check if all Shards still are alive.`);

        return true;
    }
}
