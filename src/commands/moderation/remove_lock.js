const BasicCommand = require('../../util/basic_command.js');

/**
 * @category Commands
 * @extends Command
 */
class RemoveLock extends BasicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
            category: category,

            name: 'unlock',
            aliases: [
                'remove lock',
                'removelock',
                'rmlock'
            ],
            description: 'Remove the feature lock if one was in place.',
            usage: 'remove lock <category>',
            params: [
                {
                    name: 'category',
                    description: 'Remove lock from this category',
                    type: 'string',
                    required: true
                }
            ],
            permission: {
                type: 'server',
                name: 'MANAGE_CHANNELS'
            },
            example: 'unlock music'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        const type = this.args[0];

        if (type == 'music') {
            await this.serverUtils.updateGuildOption(serverId, 'lockMusicChannel', null);
            this.msgObj.reply(`channel lock has been disabled for ${type}.`);

            return;
        }

        this.msgObj.reply(`unknown category "${type}", try again with a valid category.`);
    }
}

module.exports = RemoveLock;
