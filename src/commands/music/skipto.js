const BaseCommand = require('../../structs/base_command.js');

/**
 * @category Commands
 * @extends Command
 */
class SkipTo extends BaseCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
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
        const voicechannel = this.voiceChannel;
        if (!voicechannel) {
            this.msgObj.reply('you aren\'t in a voicechannel').then(msg => msg.delete({timeout: 5e3}));

            return;
        }

        const musicSystem = this.serverInstance.musicSystem;

        if (musicSystem.isDamonInVC(voicechannel)) {
            if (musicSystem.skipTo(this.args[0])) {
                if (this.args[0] == 1) {
                    this.msgObj.reply('skipping to the currently playing song does nothing.').then(msg => msg.delete({timeout: 5e3}));

                    return;
                }

                this.msgObj.react('👍');

                return;
            }

            this.msgObj.reply(`invalid song number. \nThe number of the song has to exist in queue, check queue with ${this.serverInstance.prefix}q <# page number>.`).then(msg => msg.delete({timeout: 5e3}));

            return;
        }

        this.msgObj.reply('you aren\'t in the bot\'s channel.').then(msg => msg.delete({timeout: 5e3}));
    }
}

module.exports = SkipTo;
