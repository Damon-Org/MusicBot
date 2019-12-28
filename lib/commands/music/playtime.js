const humanReadableTime = require('humanize-duration');

module.exports = class Queue {
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
        const
            server = msgObj.guild,
            serverId = server.id,
            musicSystem = (musicBot.serverUtils.getClassInstance(serverId)).musicSystem,
            maxPrequeue = musicSystem.queue.maxPrequeue;

        if (!musicSystem.queueExists()) {
            const newMsg = await msgObj.reply('No music is playing currently.');

            return;
        }

        msgObj.channel.send(`Music has been playing for ${humanReadableTime(Math.round((Date.now() - musicSystem.startTime) / 1000) * 1000)}`);
    }
}
