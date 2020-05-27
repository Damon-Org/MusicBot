const BaseCommand = require('../../structs/base_command.js');

/**
 * @category Commands
 * @extends BaseCommand
 */
class RemoveLock extends BaseCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(RemoveLock, {
            category: category,
            guild_only: true,

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
            permissions: {
                logic: 'OR',
                levels: [
                    {
                        type: 'server',
                        name: 'MANAGE_CHANNELS'
                    }
                ]
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
            this.serverUtils.updateGuildOption(serverId, 'lockMusicChannel', null);
            this.msgObj.reply(`channel lock has been disabled for ${type}.`);

            return;
        }

        this.msgObj.reply(`unknown category "${type}", try again with a valid category.`);
    }
}

module.exports = RemoveLock;
