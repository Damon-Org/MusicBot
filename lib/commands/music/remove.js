const Command = require('../../util/command.js');

/**
 * @category Commands
 * @extends Command
 */
class Remove extends Command {
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
            serverInstance = musicBot.serverUtils.getClassInstance(serverId),
            musicSystem = serverInstance.musicSystem;

        if (musicSystem.isDamonInVC(voicechannel)) {
            if (musicSystem.removeSong(args[0])) {
                if (!args[0] || args[0] == '' || args[0] == 1) {
                    msgObj.reply('the currently playing song has been removed.');

                    return;
                }

                msgObj.reply('the selected song has been removed.');

                return;
            }

            const newMsg = await msgObj.reply(`invalid song number. \nThe number of the song has to exist in queue, check queue with ${serverInstance.prefix}q <# page number>.`);

            newMsg.delete({timeout: 5000});

            return;
        }

        const newMsg = await msgObj.reply('you aren\'t in the bot\'s channel.');

        newMsg.delete({timeout: 5000});
    }
}

module.exports = Remove;
