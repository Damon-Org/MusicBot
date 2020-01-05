module.exports = class Record {
    /**
     * @param {Object} properties
     */
    constructor(properties) {
        Object.assign(this, properties);
    }

    /**
     * @param {MusicBot} musicBot MusicBot instance
     * @param {Message} msgObj Discord.js Message Class instance
     * @param {String} command string representing what triggered the command
     * @param {String[]} args array of string arguments
     */
    async onCommand(musicBot, msgObj, command, args) {
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
