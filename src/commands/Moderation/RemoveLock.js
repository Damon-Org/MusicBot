import BaseCommand from '@/src/structures/commands/BaseCommand.js'

export default class RemoveLock extends BaseCommand {
    /**
     * @param {String} category
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
     * @param {String} command string representing what triggered the command
     */
    async run(command) {
        const type = this.args[0];

        if (['dj', 'music'].includes(type)) {
            const otherChannels = this.server.settings.data.lockedChannels.filter(lockedChannel => lockedChannel.category !== type);

            await this.server.settings.update({
                lockedChannels: otherChannels
            });

            this.reply(`channel lock has been disabled for ${type}.`);

            return true;
        }

        this.reply(`unknown category "${type}", try again with a valid command category.`);

        return true;
    }
}
