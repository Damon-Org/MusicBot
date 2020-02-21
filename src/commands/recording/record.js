const BasicCommand = require('../../util/basic_command.js');

/**
 * @category Commands
 * @extends Command
 */
class Record extends BasicCommand {
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
            this.msgObj.reply(`you aren't a in voicechannel, join one to use this command.`);

            return;
        }

        if (this.serverInstance.musicSystem.queueExists()) {
            this.msgObj.reply('music is currently playing, I\'m unable to record and play music at the same time.');

            return;
        }

        const recordingSystem = this.serverInstance.recordingSystem;
        if (recordingSystem.recording) {
            const newMsg = await this.msgObj.reply('a voicechannel is already being recorded.');
            newMsg.delete({timeout: 5000});

            return;
        }

        if (recordingSystem.decoder.busy) {
            const newMsg = await this.msgObj.reply('the previous recording is still being decoded, please wait.');
            newMsg.delete({timeout: 5000});

            return;
        }

        this.msgObj.channel.send('**Damon Music** will start recording from whenever a user starts speaking.');
        await recordingSystem.start(msgObj, voicechannel);
    }
}

module.exports = Record;
