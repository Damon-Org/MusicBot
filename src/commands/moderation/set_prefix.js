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
            guild_only: true,

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
                    default: 'Resets the the custom prefix if one was set.'
                }
            ],
            permission: {
                type: 'server',
                name: 'MANAGE_CHANNELS'
            },
            example: 'changeprefix b?'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        const newPrefix = this.args[0];

        if (!newPrefix) {
            const prefix = this.db.commandRegisterer.default_prefix;

            this.serverInstance.setPrefix(prefix);

            const newMsg = await this.textChannel.send(`The command prefix for **Damon Music** has been reset to the default prefix \`${prefix}\``);
            newMsg.pin();

            return;
        }

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
