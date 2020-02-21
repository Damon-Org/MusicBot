const BasicCommand = require('../../util/basic_command.js');

/**
 * @category Commands
 * @extends Command
 */
class Remove extends BasicCommand {
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
            if (musicSystem.removeSong(this.args[0])) {
                if (!this.args[0] || this.args[0] == '' || this.args[0] == 1) {
                    this.msgObj.reply('the currently playing song has been removed.');

                    return;
                }

                this.msgObj.reply('the selected song has been removed.');

                return;
            }

            const newMsg = await this.msgObj.reply(`invalid song number. \nThe number of the song has to exist in queue, check queue with ${this.serverInstance.prefix}q <# page number>.`);

            newMsg.delete({timeout: 5000});

            return;
        }

        const newMsg = await this.msgObj.reply('you aren\'t in the bot\'s channel.');

        newMsg.delete({timeout: 5000});
    }
}

module.exports = Remove;
