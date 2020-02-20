const
    BasicCommand = require('../../util/basic_command.js'),
    humanReadableTime = require('humanize-duration');

/**
 * @category Commands
 * @extends Command
 */
class PlayTime extends BasicCommand {
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
        if (!this.serverInstance.musicSystem.queueExists()) {
            const newMsg = await this.msgObj.reply('No music is playing currently.');

            newMsg.delete({timeout: 5000});

            return;
        }

        this.textChannel.send(`Music has been playing for ${humanReadableTime(Math.round((Date.now() - this.serverInstance.musicSystem.startTime) / 1000) * 1000)}`);
    }
}

module.exports = PlayTime;
