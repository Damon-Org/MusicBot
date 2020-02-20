const BasicCommand = require('../../util/basic_command.js');

/**
 * @category Commands
 * @extends Command
 */
class Ping extends BasicCommand {
    /**
     * @param {Array<*>} args
     */
    constructor(...args) {
        super(...args);
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        const
            ping = new Date().getTime() - this.msgObj.createdTimestamp,
            botPing = Math.round(this.musicBot.client.ws.ping);

        const msg = await this.textChannel.send('`Pinging...`');

        const embed = new this.musicBot.Discord.MessageEmbed()
            .setTitle('Pong! 🏓')
            .addField('Ping to Discord', `${botPing}ms`)
            .addField('Response time', `${ping}ms`)
            .addField('Reply time', `${msg.createdTimestamp - this.msgObj.createdTimestamp}ms`)
            //.setDescription(`Ping to Discord: **${botPing}ms**\n\nResponse time: **${ping}ms**\n\nReply time: **${msg.createdTimestamp - msgObj.createdTimestamp}ms**`)
            .setColor('#252422');
        msg.edit('', embed);
    }
}

module.exports = Ping;
