import DJCommand from '../../../structures/DJCommand.js'

export default class DJAdd extends DJCommand {
    /**
     * @param {String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(DJAdd, {
            category: category,
            guild_only: true,

            name: 'add',
            aliases: [],
            description: 'Add a DJ user.',
            usage: 'dj add <@ mention>',
            params: [
                {
                    name: 'mention',
                    description: 'The user to be added.',
                    type: 'mention',
                    required: true
                }
            ],
            example: 'dj add'
        });
    }

    /**
     * @param {String} command string representing what triggered the command
     */
    async run(command) {
        if (!this.voiceChannel) {
            this.reply('where are you? I can\'t seem to find you in any voice channel. <:thinking_hard:560389998806040586>')
                .then(msg => msg.delete({timeout: 5e3}));

            return;
        }

        if (!this.music.isDamonInVC(this.voiceChannel)) {
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

        this.music.djManager.add(mention);
        this.send(`${mention} has been added as a DJ!`);
    }
}
