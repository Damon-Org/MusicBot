const BaseCommand = require('../../structs/base_command.js');

/**
 * Class name speaks for itself
 * @category Commands
 * @extends BaseCommand
 */
class Test extends BaseCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(Test, {
            category: category,
            hidden: true,

            name: 'test',
            aliases: [],
            description: 'Ban a user from using the bot',
            usage: 'ban user <@ user> [reason]',
            params: [
                {
                    name: 'reason',
                    description: 'The reason why a user was banned.',
                    type: 'string',
                    default: null,
                    allow_sentence: true
                }
            ],
            sysem_permission: {
                level: 2,
                condition: '<='
            },
            example: ''
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        console.log(this.msgObj.guild);
    }
}

module.exports = Test;
