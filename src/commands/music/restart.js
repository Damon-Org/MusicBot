const MusicCommand = require('../../structs/music_command.js');

/**
 * @category Commands
 * @extends MusicCommand
 */
class Restart extends MusicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(Restart, {
            category: category,
            guild_only: true,

            name: 'restart',
            aliases: [],
            description: 'The queue will be rewinded to the start.',
            usage: 'leave',
            params: [],
            example: 'restart'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        if (this.musicSystem.isDamonInVC(this.voiceChannel) && this.musicSystem.queueExists()) {
            this.send('The queue has been reset to the start.');

            this.musicSystem.queue.rewind();
            this.musicSystem.doNotSkip = true;

            this.musicSystem.repeat = false;

            if (this.musicSystem.shutdown.type() == 'leave') {
                this.musicSystem.shutdown.cancel();
                this.musicSystem.playNext();

                return true;
            }
            this.musicSystem.player.stopTrack();

            return true;
        }

        this.reply('you aren\'t in my voice channel or I\'m not done playing music! 😣')
            .then(msg => msg.delete({timeout: 5e3}));

        return true;
    }
}

module.exports = Restart;
