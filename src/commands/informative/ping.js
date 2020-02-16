const Command = require('../../util/command.js');

/**
 * @category Commands
 * @extends Command
 */
class Ping extends Command {
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
            ping = new Date().getTime() - msgObj.createdTimestamp,
            botPing = Math.round(musicBot.client.ws.ping);

        const msg = await msgObj.channel.send('`Pinging...`');

        const embed = new musicBot.Discord.MessageEmbed()
            .setTitle('Pong! 🏓')
            .addField('Ping to Discord', `${botPing}ms`)
            .addField('Response time', `${ping}ms`)
            .addField('Reply time', `${msg.createdTimestamp - msgObj.createdTimestamp}ms`)
            //.setDescription(`Ping to Discord: **${botPing}ms**\n\nResponse time: **${ping}ms**\n\nReply time: **${msg.createdTimestamp - msgObj.createdTimestamp}ms**`)
            .setColor('#252422');
        msg.edit('', embed);
    }
}

module.exports = Ping;
