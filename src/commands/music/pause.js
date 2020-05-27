const MusicCommand = require('../../structs/music_command.js');

/**
 * @category Commands
 * @extends MusicCommand
 */
class Pause extends MusicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(Pause, {
            category: category,
            guild_only: true,

            name: 'pause',
            aliases: [],
            description: 'Music playback will be paused.',
            usage: 'pause',
            params: [],
            example: 'pause'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        if (this.musicSystem.isDamonInVC(this.voiceChannel)) {
            if (this.musicSystem.pausePlayback()) {
                this.send('Music playback has been paused.');

                return true;
            }

            this.reply('music is already paused, use `resume` command to continue playing.')
                .then(msg => msg.delete({timeout: 5e3}));

            return true;
        }

        this.reply('you aren\'t in my voice channel! 😣')
            .then(msg => msg.delete({timeout: 5e3}));

        return true;
    }
}

module.exports = Pause;
