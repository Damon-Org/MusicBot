const BasicCommand = require('../../utils/basic_command.js');

/**
 * @category Commands
 * @extends Command
 */
class RepeatPlaylist extends BasicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
            category: category,

            name: 'repeat playlist',
            aliases: [
                'repeatplaylist',
                'repplaylist',
                'rep playlist'
            ],
            description: 'The entire queue is looped, when the end of the queue is reached it starts over.',
            usage: 'repeat playlist',
            params: [],
            examples: []
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        const voicechannel = this.voiceChannel;
        if (!voicechannel) {
            const newMsg = await this.msgObj.reply('you aren\'t in a voicechannel');

            newMsg.delete({timeout: 5000});

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

        const newMsg = await this.msgObj.reply('you aren\'t in the bot\'s channel.');

        newMsg.delete({timeout: 5000});
    }
}

module.exports = RepeatPlaylist;
