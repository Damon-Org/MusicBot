const
    BaseCommand = require('../../structs/base_command.js'),
    CommandRegistrar = require('../command.js');

/**
 * Class name speaks for itself
 * @category Commands
 * @extends BaseCommand
 */
class ReloadCommands extends BaseCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(ReloadCommands, {
            category: category,
            hidden: true,

            name: 'reload commands',
            aliases: [],
            description: 'Reload all the commands in memory',
            usage: 'reload commands',
            params: [],
            sysem_permission: {
                level: 1,
                condition: '='
            },
            example: 'reload commands'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        this.db.commandRegistrar.setup();

        this.send('Commands have been **reloaded**!');

        return true;
    }
}

module.exports = ReloadCommands;
