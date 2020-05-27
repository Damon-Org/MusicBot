const MusicCommand = require('../../structs/music_command.js');

/**
 * @category Commands
 * @extends MusicCommand
 */
class SkipTo extends MusicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(SkipTo, {
            category: category,
            guild_only: true,

            name: 'skip to',
            aliases: [
                'skipto'
            ],
            description: 'Removes a song from the queue',
            usage: 'skip to <#queue-number>',
            params: [
                {
                    name: 'queue-number',
                    description: 'Number of a song in queue',
                    type: 'number',
                    required: true
                }
            ],
            example: 'skipto 5'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        if (this.musicSystem.isDamonInVC(this.voiceChannel)) {
            if (await this.musicSystem.skipTo(this.args[0])) {
                if (this.args[0] == 1) {
                    this.reply('skipping to the currently playing song does nothing.')
                        .then(msg => msg.delete({timeout: 5e3}));

                    return true;
                }

                this.msgObj.react('👍');

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

module.exports = SkipTo;
