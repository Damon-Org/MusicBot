const { RichEmbed } = require('discord.js');

module.exports = class Ping {
    constructor() {

    }

    /**
     * @param {MusicBot} musicBot MusicBot instance
     * @param {Message} msgObj Discord.js Message Class instance
     * @param {string} command string representing what triggered the command
     * @param {string[]} args array of string arguments
     */
    async onCommand(musicBot, msgObj, command, args) {
        const
            ping = new Date().getTime() - msgObj.createdTimestamp,
            botPing = Math.round(musicBot.client.ping);

        const msg = await msgObj.channel.send('`Pinging...`');

        const embed = new RichEmbed()
            .setTitle('Pong! 🏓')
            .setDescription(`Ping to Discord: **${botPing}ms**\n\nResponse time: **${ping}ms**\n\nReply time: **${msg.createdTimestamp - msgObj.createdTimestamp}ms**`)
            .setColor('#252422');
        msg.edit(embed);
    }
}