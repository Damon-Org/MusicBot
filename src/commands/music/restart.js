const BasicCommand = require('../../util/basic_command.js');

/**
 * @category Commands
 * @extends Command
 */
class Leave extends BasicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
            category: category,

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
        const voicechannel = this.voiceChannel;
        if (!voicechannel) {
            const newMsg = await this.msgObj.reply('you aren\'t in a voicechannel');

            newMsg.delete({timeout: 5000});

            return;
        }

        const musicSystem = this.serverInstance.musicSystem;

        if (musicSystem.isDamonInVC(voicechannel) && musicSystem.queueExists()) {
            this.textChannel.send('The queue has been reset to the start.');

            musicSystem.queue.rewind();
            musicSystem.doNotSkip = true;

            if (musicSystem.shutdown.type() == 'leave') {
                musicSystem.shutdown.cancel();
                musicSystem.playNext();

                return;
            }
            musicSystem.player.stopTrack();

            return;
        }

        const newMsg = await this.msgObj.reply('you aren\'t in the bot\'s channel or is not done playing music.');

        newMsg.delete({timeout: 5000});
    }
}

module.exports = Leave;
