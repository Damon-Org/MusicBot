const BasicCommand = require('../../util/basic_command.js');

/**
 * Class name speaks for itself
 * @category Commands
 * @extends Command
 */
class BanUser extends BasicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
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
            permission: {
                type: 'system',
                level: 2
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

module.exports = BanUser;
