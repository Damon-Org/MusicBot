const MusicCommand = require('../../structs/dj_command.js');

/**
 * @category Commands
 * @extends MusicCommand
 */
class Repeat extends MusicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(Repeat, {
            category: category,
            guild_only: true,

            name: 'repeat',
            aliases: ['loop'],
            description: 'Will repeat the currently playing song.',
            usage: 'repeat',
            params: [],
            example: 'repeat'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        if (this.musicSystem.isDamonInVC(this.voiceChannel)) {
            if (this.musicSystem.queue.active() == null) {
                this.reply('the currently playing song has been removed, thus it cannot be put in repeat.')
                    .then(msg => msg.delete({timeout: 5e3}));

                return true;
            }

            if (this.musicSystem.repeatToggle()) {
                this.send('Repeat has been **enabled**.');

                return true;
            }

            this.send('Repeat has been **disabled**.');

            return true;
        }

        this.reply('you aren\'t in my voice channel! 😣')
            .then(msg => msg.delete({timeout: 5e3}));

        return true;
    }
}

module.exports = Repeat;
