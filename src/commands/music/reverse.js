const MusicCommand = require('../../structs/music_command.js');

/**
 * @category Commands
 * @extends MusicCommand
 */
class Reverse extends MusicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(Reverse, {
            category: category,
            guild_only: true,

            name: 'reverse',
            aliases: [],
            description: 'Reverse the queue.',
            usage: 'reverse',
            params: [],
            example: 'reverse'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        if (!this.musicSystem.isDamonInVC(this.voiceChannel)) {
            this.reply('you aren\'t in my voice channel! 😣')
                .then(msg => msg.delete({timeout: 5e3}));

            return true;
        }

        this.musicSystem.queue.reverse();
        this.musicSystem.cacheSongIfNeeded();

        this.send('🔄 The queue has been reversed, you can use `restart` to start from the beginning of the queue. 🔄');
    }
}

module.exports = Reverse;
