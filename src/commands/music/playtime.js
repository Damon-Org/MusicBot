const
    Command = require('../../util/command.js'),
    humanReadableTime = require('humanize-duration');

/**
 * @category Commands
 * @extends Command
 */
class PlayTime extends Command {
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
        const
            server = msgObj.guild,
            serverId = server.id,
            musicSystem = (musicBot.serverUtils.getClassInstance(serverId)).musicSystem,
            maxPrequeue = musicSystem.queue.maxPrequeue;

        if (!musicSystem.queueExists()) {
            const newMsg = await msgObj.reply('No music is playing currently.');

            newMsg.delete({timeout: 5000});

            return;
        }

        msgObj.channel.send(`Music has been playing for ${humanReadableTime(Math.round((Date.now() - musicSystem.startTime) / 1000) * 1000)}`);
    }
}

module.exports = PlayTime;
