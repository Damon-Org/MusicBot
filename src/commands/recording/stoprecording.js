const BaseCommand = require('../../structs/base_command.js');

/**
 * @category Commands
 * @extends Command
 */
class StopRecording extends BaseCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
            category: category,
            disabled: true,

            name: 'stop recording',
            aliases: [
                'stoprecording'
            ],
            description: 'This command will stop the bot from recording.',
            usage: 'stop recording',
            params: [],
            examples: 'stoprecording'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        const voicechannel = this.voiceChannel;
        if (!voicechannel) {
            msgObj.reply(`you aren't a in voicechannel, join one to use this command.`);

            return;
        }

        const recordingSystem = this.serverInstance.recordingSystem;

        if (!recordingSystem.recording) {
            this.msgObj.reply('no recording to stop in this server.').then(msg => msg.delete({timeout: 5e3}));

            return;
        }

        this.textChannel.send('Gracefully closing the recording and saving them.');
        recordingSystem.closeConnections();
        this.textChannel.send('Decoding of RAW PCM data to WAV will now begin, please be patient.');

        recordingSystem.startDecodingLast();

        while (recordingSystem.decoder.decodingPercentage() < 99) {
            console.log('Decoding');
        }

        this.textChannel.send('Decoding done.');
    }
}

module.exports = StopRecording;
