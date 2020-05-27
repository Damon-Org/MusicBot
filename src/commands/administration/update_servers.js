const BaseCommand = require('../../structs/base_command.js');

/**
 * Class name speaks for itself
 * @category Commands
 * @extends BaseCommand
 */
class UpdateServers extends BaseCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(UpdateServers, {
            category: category,
            hidden: true,

            name: 'updateservers',
            aliases: [
                'update servers'
            ],
            description: 'Update servers in database',
            usage: 'updateservers',
            params: [],
            sysem_permission: {
                level: 2,
                condition: '<='
            },
            example: 'updateservers'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        const servers = this.db.client.guilds;
        for (let server of servers) {
            this.serverUtils.addGuildIfNotExists(server[1]);
        }

        this.user.send('Updated servers in DB.');
    }
}

module.exports = UpdateServers;
