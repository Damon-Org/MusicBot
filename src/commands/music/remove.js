const MusicCommand = require('../../structs/music_command.js');

/**
 * @category Commands
 * @extends MusicCommand
 */
class Remove extends MusicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(Remove, {
            category: category,
            guild_only: true,

            name: 'remove',
            aliases: [
                'rm',
                'remove song',
                'removesong'
            ],
            description: 'Removes a song from the queue',
            usage: 'remove [song-number]',
            params: [
                {
                    name: 'song-number',
                    description: 'Number of a song in queuer',
                    type: 'number',
                    default: 'Will remove the currently playing song from queue'
                }
            ],
            example: 'remove 3'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        if (!this.voiceChannel) {
            this.reply('you aren\'t in a voicechannel')
                .then(msg => msg.delete({timeout: 5e3}));

            return true;
        }

        if (this.musicSystem.isDamonInVC(this.voiceChannel)) {
            if (this.musicSystem.removeSong(this.args[0])) {
                if (!this.args[0] || this.args[0] == '' || this.args[0] == 1) {
                    this.reply('the currently playing song has been removed.');

                    return true;
                }

                this.reply('the selected song has been removed.');

                return true;
            }

            this.reply(`invalid song number. \nThe number of the song has to exist in queue, check queue with ${this.serverInstance.prefix}q <# page number>.`)
                .then(msg => msg.delete({timeout: 5e3}));

            return true;
        }

        this.reply('you aren\'t in my voice channel! 😣')
            .then(msg => msg.delete({timeout: 5e3}));

        return true;
    }
}

module.exports = Remove;
