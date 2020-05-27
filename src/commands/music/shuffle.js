const MusicCommand = require('../../structs/music_command.js');

/**
 * @category Commands
 * @extends MusicCommand
 */
class Shuffle extends MusicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(Shuffle, {
            category: category,
            guild_only: true,

            name: 'shuffle',
            aliases: [],
            description: 'Shuffle songs in queue.',
            usage: 'shuffle',
            params: [],
            example: 'shuffle'
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

        this.musicSystem.queue.shuffle();
        this.musicSystem.cacheSongIfNeeded();

        this.send('🔀 The queue has been shuffled. 🔀');

        return true;
    }
}

module.exports = Shuffle;
