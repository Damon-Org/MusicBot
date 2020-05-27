const MusicCommand = require('../../structs/music_command.js');

/**
 * @category Commands
 * @extends MusicCommand
 */
class RepeatPlaylist extends MusicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(RepeatPlaylist, {
            category: category,
            guild_only: true,

            name: 'repeat playlist',
            aliases: [
                'repeatplaylist',
                'repplaylist',
                'rep playlist'
            ],
            description: 'The entire queue is looped, when the end of the queue is reached it starts over.',
            usage: 'repeat playlist',
            params: [],
            example: 'repeatplaylist'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        if (this.musicSystem.isDamonInVC(this.voiceChannel)) {
            if (this.musicSystem.repeatQueueToggle()) {
                this.send('Playlist repeat has been **enabled**.');

                return true;
            }

            this.send('Playlist repeat has been **disabled**.');

            return true;
        }

        this.msgObj.reply('you aren\'t in my voice channel! 😣')
            .then(msg => msg.delete({timeout: 5e3}));

        return true;
    }
}

module.exports = RepeatPlaylist;
