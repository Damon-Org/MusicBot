const DJCommand = require('../../structs/dj_command');

/**
 * @category Commands
 * @extends DJCommand
 */
class DJLeave extends DJCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(DJLeave, {
            category: category,
            guild_only: true,

            name: 'dj leave',
            aliases: [
                'resign'
            ],
            description: 'Add a DJ user.',
            usage: 'dj leave',
            params: [],
            example: 'dj leave'
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

        this.musicSystem.djManager.resign(this.serverMember);

        this.reply('bye bye DJ. 👋');
    }
}

module.exports = DJLeave;
