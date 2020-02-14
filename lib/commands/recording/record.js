const Command = require('../../util/command.js');

class Record extends Command {
    /**
     * @param {Object} properties
     */
    constructor(properties) {
        super(properties);
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
            musicSystem = serverInstance.musicSystem;

        if (musicSystem.queueExists()) {
            msgObj.reply('music is currently playing, I\'m unable to record and play music at the same time.');

            return;
        }

        const recordingSystem = serverInstance.recordingSystem;

        if (recordingSystem.recording) {
            const newMsg = await msgObj.reply('a voicechannel is already being recorded.');
            newMsg.delete({timeout: 5000});

            return;
        }

        if (recordingSystem.decoder.busy) {
            const newMsg = await msgObj.reply('the previous recording is still being decoded, please wait.');
            newMsg.delete({timeout: 5000});

            return;
        }

        msgObj.channel.send('**Damon Music** will start recording from whenever a user starts speaking.');
        await recordingSystem.start(msgObj, voicechannel);
    }
}

module.exports = Record;
