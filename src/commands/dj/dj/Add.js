import DJCommand from '../../../structures/commands/DJCommand.js'

export default class DJAdd extends DJCommand {
    /**
     * @param {string} category
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
     * @param {string} command string representing what triggered the command
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

        if (this.dj.mode === this.mode['FREEFORALL']) {
            if (!this.elevated) {
                this.reply('as a normal user you can\'t add a DJ user without having the "DJ" role or without having the "MANAGE_GUILD" permission.')
                    .then(msg => msg.delete({timeout: 5e3}));

                return;
            }

            this.dj.setMode(this.mode['MANAGED']);
            this.send('The DJ mode has been set to `MANAGED`.');
        }

        this.dj.add(mention);
        this.send(`${mention} has been added as a DJ!`);
    }
}
