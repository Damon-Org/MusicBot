const BasicCommand = require('../../util/basic_command.js');

/**
 * @category Commands
 * @extends Command
 */
class Record extends BasicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
            category: category,
            disabled: true,

            name: 'record',
            aliases: [],
            description: 'This command will record the current voicechat after everyone has given their consent.',
            usage: 'record',
            params: [],
            examples: 'record'
        });
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

        await recordingSystem.start(this.msgObj, voicechannel);
    }
}

module.exports = Record;
