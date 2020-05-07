const BaseCommand = require('../../structs/base_command.js');

/**
 * @category Commands
 * @extends Command
 */
class Ping extends BaseCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
            category: category,

            name: "ping",
            aliases: [
                "pong"
            ],
            description: "Shows ping to Discord, response time and reply time.",
            usage: "ping",
            params: [],
            example: 'ping'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        const
            ping = new Date().getTime() - this.msgObj.createdTimestamp,
            botPing = Math.round(this.db.client.ws.ping);

        this.textChannel.send('`Pinging...`').then(msg => {
            const embed = new this.db.Discord.MessageEmbed()
                .setTitle('Pong! 🏓')
                .addField('Ping to Discord', `${botPing}ms`)
                .addField('Response time', `${ping}ms`)
                .addField('Reply time', `${msg.createdTimestamp - this.msgObj.createdTimestamp}ms`)
                .setColor('#252422');
            msg.edit('', embed);
        });
    }
}

module.exports = Ping;
