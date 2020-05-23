const BaseCommand = require('../../structs/base_command.js');

/**
 * This command is limited to admin's of the highest permission level or the owner
 * It will lock the bot from being used by anyone but the administrator
 * @category Commands
 * @extends Command
 */
class LockDown extends BaseCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
            category: category,
            disabled: true,
            hidden: true,

            name: 'lockdown',
            aliases: [],
            description: 'Shuts the bot down from being used by anyone else.',
            usage: 'lock down <boolean>',
            params: [
                {
                    name: 'boolean',
                    description: 'True to enable lockdown, false to disable.',
                    type: 'boolean',
                    required: true
                }
            ],
            sysem_permission: {
                level: 2,
                condition: '<='
            },
            example: 'lockdown'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {

    }
}

module.exports = LockDown;
