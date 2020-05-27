const DJCommand = require('../../../structs/dj_command');

/**
 * @category Commands
 * @extends DJCommand
 */
class DJRemove extends DJCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(DJRemove, {
            category: category,
            guild_only: true,

            name: 'remove',
            aliases: [],
            description: 'This command forcefully resigns a DJ from his position.',
            usage: 'dj remove <@ mention>',
            params: [
                {
                    name: 'mention',
                    description: 'The user to be forcefully resigned.',
                    type: 'mention',
                    required: true
                }
            ],
            permissions: {
                logic: 'OR',
                levels: [
                    {
                        type: 'SERVER',
                        name: 'MANAGE_GUILD'
                    }
                ]
            },
            example: 'dj remove @Yimura#6969'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        if (!this.voiceChannel) {
            this.reply('where are you? I can\'t seem to find you in any voice channel. <:thinking_hard:560389998806040586>')
                .then(msg => msg.delete({timeout: 5e3}));

            return;
        }

        if (!this.musicSystem.isDamonInVC(this.voiceChannel)) {
            this.reply('you aren\'t in my voice channel! 😣')
                .then(msg => msg.delete({timeout: 5e3}));

            return;
        }

        const mention = this.msgObj.mentions.members.first();
        if (!mention) {
            this.reply('no user was mentioned or the mention is invalid.')
                .then(msg => msg.delete({timeout: 5e3}));

            return;
        }

        this.musicSystem.djManager.resign(mention);
    }
}

module.exports = DJRemove;