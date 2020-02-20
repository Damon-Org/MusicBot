const BasicCommand = require('../../util/basic_command.js');

/**
 * Class name speaks for itself
 * @category Commands
 * @extends Command
 */
class UpdateServers extends BasicCommand {
    /**
     * @param {Array<*>} args
     */
    constructor(...args) {
        super(...args);
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        const servers = this.musicBot.client.guilds;
        for (let server of servers) {
            this.serverUtils.addGuildIfNotExists(server[1]);
        }

        this.user.send('Updated servers in DB.');
    }
}

module.exports = UpdateServers;
