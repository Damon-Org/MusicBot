const MusicCommand = require('../../structs/dj_command.js');

/**
 * @category Commands
 * @extends MusicCommand
 */
class Resume extends MusicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(Resume, {
            category: category,
            guild_only: true,

            name: 'resume',
            aliases: [],
            description: 'Music playback will be resumed.',
            usage: 'resume',
            params: [],
            example: 'resume'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        if (this.musicSystem.isDamonInVC(this.voiceChannel)) {
            if (this.musicSystem.resumePlayback()) {
                this.send('Music playback has been resumed.');
            }

            return true;
        }

        this.reply('you aren\'t in my voice channel! 😣')
            .then(msg => msg.delete({timeout: 5e3}));

        return true;
    }
}

module.exports = Resume;
