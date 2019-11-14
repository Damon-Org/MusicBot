module.exports = class Ping {
    /**
     * @param {Object} properties
     */
    constructor(properties) {
        Object.assign(this, properties);
    }

    /**
     * @param {MusicBot} musicBot MusicBot instance
     * @param {Discord.Message} msgObj Discord.js Message Class instance
     * @param {string} command string representing what triggered the command
     * @param {string[]} args array of string arguments
     */
    async onCommand(musicBot, msgObj, command, args) {
        const
            ping = new Date().getTime() - msgObj.createdTimestamp,
            botPing = Math.round(musicBot.client.ping);

        const msg = await msgObj.channel.send('`Pinging...`');

        const embed = new musicBot.Discord.RichEmbed()
            .setTitle('Pong! 🏓')
            .setDescription(`Ping to Discord: **${botPing}ms**\n\nResponse time: **${ping}ms**\n\nReply time: **${msg.createdTimestamp - msgObj.createdTimestamp}ms**`)
            .setColor('#252422');
        msg.edit(embed);
    }
}
