import BaseCommand from '../../structures/commands/BaseCommand.js'

export default class Lock extends BaseCommand {
    /**
     * @param {String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(Lock, {
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
            permissions: {
                logic: 'OR',
                levels: [
                    {
                        type: 'server',
                        name: 'MANAGE_CHANNELS'
                    }
                ]
            },
            example: 'lock music #music'
        });
    }

    /**
     * @param {String} command string representing what triggered the command
     */
    async run(command) {
        const
            channel = this.msgObj.mentions.channels.first() || this.textChannel,
            type = this.args[0];

        if (type == 'music') {
            this.server.options.update('lockMusicChannel', channel.id);
            this.server._lockedChannels['music'] = channel.id;

            this.reply(`channel lock has been enabled for ${type} on channel ${channel}`);

            return true;
        }

        this.reply(`unknown category "${type}", try again with a valid category.`);

        return true;
    }
}
