const Command = require('../../util/command.js');

/**
 * @category Commands
 * @extends Command
 */
class Repeat extends Command {
    /**
     * @param {Object} properties
     */
    constructor(properties) {
        super(properties);
    }

    /**
     * @param {MusicBot} musicBot MusicBot instance
     * @param {external:Discord_Message} msgObj Discord.js Message Class instance
     * @param {external:String} command string representing what triggered the command
     * @param {external:String[]} args array of string arguments
     */
    async onCommand(musicBot, msgObj, command, args) {
        const voicechannel = msgObj.member.voice.channel;
        if (!voicechannel) {
            const newMsg = await msgObj.reply('you aren\'t in a voicechannel');

            newMsg.delete({timeout: 5000});

            return;
        }

        const
            serverId = msgObj.guild.id,
            musicSystem = (musicBot.serverUtils.getClassInstance(serverId)).musicSystem;

        if (musicSystem.isDamonInVC(voicechannel)) {
            if (musicSystem.queue.active() == null) {
                const newMsg = await msgObj.reply('the currently playing song has been removed, thus it cannot be put in repeat.');

                newMsg.delete({timeout: 5000});

                return;
            }

            if (musicSystem.repeatToggle()) {
                msgObj.channel.send('Repeat has been **enabled**.');

                return;
            }

            msgObj.channel.send('Repeat has been **disabled**.');

            return;
        }

        const newMsg = await msgObj.reply('you aren\'t in the bot\'s channel.');

        newMsg.delete({timeout: 5000});
    }
}

module.exports = Repeat;
