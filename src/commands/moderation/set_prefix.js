const BasicCommand = require('../../util/basic_command.js');

/**
 * @category Commands
 * @extends Command
 */
class SetPrefix extends BasicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
            category: category,

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
                    required: true
                }
            ],
            permission: {
                type: 'server',
                name: 'MANAGE_CHANNELS'
            },
            examples: [
                'setprefix !',
                'changeprefix b?'
            ]
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        const newPrefix = this.args[0];

        if (/^[\x00-\x7F]*$/.test(newPrefix) && newPrefix.length <= 6) {
            const oldPrefix = await this.serverInstance.getPrefix();

            this.serverInstance.setPrefix(newPrefix);

            const newMsg = await this.textChannel.send(`The command prefix for **Damon Music** has been changed in this server has been changed from \`${oldPrefix}\` to \`${newPrefix}\``);
            newMsg.pin();

            return;
        }

        const newMsg = await this.msgObj.reply('new prefix is not a valid ASCII character or is longer than 6 characters, make sure you aren\'t using unicode or emoji\'s as a prefix.');
        newMsg.delete({timeout: 5000});
    }
}

module.exports = SetPrefix;
