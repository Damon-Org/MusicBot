const BasicCommand = require('../../util/basic_command.js');

/**
 * @category Commands
 * @extends Command
 */
class Lock extends BasicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
            category: category,
            guild_only: true,

            name: 'lock',
            aliases: [],
            description: 'Lock specific command category to one channel.',
            usage: 'lock <category> [# channel]',
            params: [
                {
                    name: 'category',
                    description: 'Lock a command category to one channel',
                    type: 'string',
                    required: true
                },
                {
                    name: '# channel',
                    description: 'Mention a channel with #channelname',
                    type: 'reference',
                    default: 'Takes the channel the command was ran in'
                }
            ],
            permission: {
                type: 'server',
                name: 'MANAGE_CHANNELS'
            },
            example: 'lock music #music'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        const
            channel = this.msgObj.mentions.channels.first() || this.textChannel,
            type = this.args[0];

        if (type == 'music') {
            await this.serverUtils.updateGuildOption(this.serverInstance.id, 'lockMusicChannel', channel.id);

            this.msgObj.reply(`channel lock has been enabled for ${type} on channel ${channel}`);

            return;
        }

        this.msgObj.reply(`unknown category "${type}", try again with a valid category.`);
    }
}

module.exports = Lock;
