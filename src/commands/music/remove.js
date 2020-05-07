const BaseCommand = require('../../structs/base_command.js');

/**
 * @category Commands
 * @extends Command
 */
class Remove extends BaseCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
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
        const voicechannel = this.voiceChannel;
        if (!voicechannel) {
            this.msgObj.reply('you aren\'t in a voicechannel').then(msg => msg.delete({timeout: 5e3}));

            return;
        }

        const musicSystem = this.serverInstance.musicSystem;
        if (musicSystem.isDamonInVC(voicechannel)) {
            if (musicSystem.removeSong(this.args[0])) {
                if (!this.args[0] || this.args[0] == '' || this.args[0] == 1) {
                    this.msgObj.reply('the currently playing song has been removed.');

                    return;
                }

                this.msgObj.reply('the selected song has been removed.');

                return;
            }

            this.msgObj.reply(`invalid song number. \nThe number of the song has to exist in queue, check queue with ${this.serverInstance.prefix}q <# page number>.`).then(msg => msg.delete({timeout: 5e3}));

            return;
        }

        this.msgObj.reply('you aren\'t in the bot\'s channel.').then(msg => msg.delete({timeout: 5e3}));
    }
}

module.exports = Remove;
