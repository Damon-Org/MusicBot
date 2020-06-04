const
    BaseCommand = require('../../structs/base_command.js'),
    CommandRegistrar = require('../command.js');

/**
 * Class name speaks for itself
 * @category Commands
 * @extends BaseCommand
 */
class Reload extends BaseCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(Reload, {
            category: category,
            hidden: true,

            name: 'reload',
            aliases: [],
            description: 'Reload all the commands in memory',
            usage: 'reload <type>',
            params: [
                {
                    name: 'type',
                    description: 'The level of stuff that needs to be reloaded.',
                    type: 'string',
                    required: true
                }
            ],
            sysem_permission: {
                level: 1,
                condition: '='
            },
            example: 'reload'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        const reloadLevel = this.args[0];

        if (!['full', 'bot', 'commands', 'server'].includes(reloadLevel)) {
            this.send('Unknown reload level!');

            return false;
        }

        if (reloadLevel === 'full' || reloadLevel === 'bot')
            this.db.upgrade();

        if (reloadLevel === 'full' || reloadLevel === 'server')
            for (const server of this.db.servers.values())
                server.upgrade();

        if (reloadLevel === 'full' || reloadLevel === 'commands')
            this.db.commandRegistrar.setup();

        global.version = require('../../../package.json').version;

        this.send(
`Reload has been done, the following will never be upgraded and require a full restart:
\`\`\`- APICollections
- LavaLink Communicator
- LazyLoader
- SocketCommunication
- DB Connection\`\`\``
        );

        return true;
    }
}

module.exports = Reload;
