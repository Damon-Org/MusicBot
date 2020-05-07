const BaseCommand = require('../../structs/base_command.js');

/**
 * @category Commands
 * @extends Command
 */
class Record extends BaseCommand {
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
            this.msgObj.reply('a voicechannel is already being recorded.').then(msg => msg.delete({timeout: 5e3}));

            return;
        }

        if (recordingSystem.decoder.busy) {
            this.msgObj.reply('the previous recording is still being decoded, please wait.').then(msg => msg.delete({timeout: 5e3}));

            return;
        }

        await recordingSystem.start(this.msgObj, voicechannel);
    }
}

module.exports = Record;
