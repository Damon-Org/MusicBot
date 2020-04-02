const
    BasicCommand = require('../../util/basic_command.js'),
    humanReadableTime = require('humanize-duration');

/**
 * @category Commands
 * @extends Command
 */
class Stats extends BasicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
            name: 'stats',
            aliases: [
                'status'
            ],
            description: 'Shows a couple of stats about Damon.',
            usage: 'stats',
            params: [],
            examples: []
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    run(command) {
        const embed = new this.db.Discord.MessageEmbed()
            .setTitle('Statistics? Stats? Mmmm whatever...')
            .addField('Uptime', humanReadableTime(Math.round((Date.now() - this.db.bootUp) / 1000) * 1000))
            .addField('Active Music Players', this.db.carrier.totalPlayers)
            .addField('Bot Version', `v${global.version}`)
            .addField('Environment Version', `Node ${process.version}`)
            .addField('Created by', this.db.creator.tag);

        if (this.db.client.shard.count <= 1) {
            embed.addField('Total Guild Count', this.db.client.guilds.size);
        }
        else {
            embed.addField('This instance is managing', `${this.db.client.guilds.size} servers`);
            embed.addField('Total Guild Count', `${this.db.presence_values.serverCount}`)
        }

        this.textChannel.send(embed);
    }
}

module.exports = Stats;
