const BasicCommand = require('../../utils/basic_command.js');

/**
 * @category Commands
 * @extends Command
 */
class StopRecording extends BasicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
            category: category,

            name: 'stop recording',
            aliases: [
                'stoprecording'
            ],
            description: 'This command will stop the bot from recording.',
            usage: 'stop recording',
            params: [],
            examples: []
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        const voicechannel = msgObj.member.voice.channel;
        if (!voicechannel) {
            msgObj.reply(`you aren't a in voicechannel, join one to use this command.`);

            return;
        }

        const
            serverInstance = musicBot.serverUtils.getClassInstance(msgObj.guild.id),
            recordingSystem = serverInstance.recordingSystem;

        if (!recordingSystem.recording) {
            const newMsg = await msgObj.reply('no recording to stop in this server.');
            newMsg.delete({timeout: 5000});

            return;
        }

        msgObj.channel.send('Gracefully closing the recording and saving them.');
        recordingSystem.closeConnections();
        msgObj.channel.send('Decoding of RAW PCM data to WAV will now begin, please be patient.');

        recordingSystem.startDecodingLast();

        while (recordingSystem.decoder.decodingPercentage() < 99) {
            console.log('Decoding');
        }

        msgObj.channel.send('Decoding done.');
    }
}

module.exports = StopRecording;
