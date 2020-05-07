const BaseCommand = require('../../structs/base_command.js');

/**
 * @category Commands
 * @extends Command
 */
class RepeatPlaylist extends BaseCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
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
        const voicechannel = this.voiceChannel;
        if (!voicechannel) {
            this.msgObj.reply('you aren\'t in a voicechannel').then(msg => msg.delete({timeout: 5e3}));

            return;
        }

        const musicSystem = this.serverInstance.musicSystem;

        if (musicSystem.isDamonInVC(voicechannel)) {
            if (musicSystem.repeatQueueToggle()) {
                this.textChannel.send('Playlist repeat has been **enabled**.');

                return;
            }

            this.textChannel.send('Playlist repeat has been **disabled**.');

            return;
        }

        this.msgObj.reply('you aren\'t in the bot\'s channel.').then(msg => msg.delete({timeout: 5e3}));
    }
}

module.exports = RepeatPlaylist;
