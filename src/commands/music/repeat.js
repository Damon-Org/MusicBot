const BasicCommand = require('../../util/basic_command.js');

/**
 * @category Commands
 * @extends Command
 */
class Repeat extends BasicCommand {
    /**
     * @param {Array<*>} args
     */
    constructor(...args) {
        super(...args);
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
            if (musicSystem.queue.active() == null) {
                const newMsg = await this.msgObj.reply('the currently playing song has been removed, thus it cannot be put in repeat.');

                newMsg.delete({timeout: 5000});

                return;
            }

            if (musicSystem.repeatToggle()) {
                this.textChannel.send('Repeat has been **enabled**.');

                return;
            }

            this.textChannel.send('Repeat has been **disabled**.');

            return;
        }

        const newMsg = await this.msgObj.reply('you aren\'t in the bot\'s channel.');

        newMsg.delete({timeout: 5000});
    }
}

module.exports = Repeat;