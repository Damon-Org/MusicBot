import BaseCommand from '../../structures/commands/BaseCommand.js'
import humanReadableTime from 'humanize-duration'

export default class Stats extends BaseCommand {
    /**
     * @param {String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(Stats, {
            name: 'stats',
            aliases: [
                'status'
            ],
            description: 'Shows a couple of stats about Damon.',
            usage: 'stats',
            params: [],
            example: 'stats'
        });
    }

    /**
     * @param {String} command string representing what triggered the command
     */
    run(command) {
        const embed = new this.Discord.MessageEmbed()
            .setTitle('Statistics? Stats? Mmmm whatever...')
            .addField('Uptime', humanReadableTime(Math.round((Date.now() - this.mainClient.bootUp) / 1000) * 1000))
            //.addField('Active Music Players', this.db.carrier.totalPlayers)
            .addField('Bot Version', this.mainClient.version)
            .addField('Environment Version', `Node ${process.version}`)
            .addField('Created by', this.mainClient.config.creator);

        if (this.mainClient.shard.count <= 1) {
            embed.addField('Total Guild Count', this.mainClient.guilds.cache.size);
        }
        else {
            embed.addField('This instance is managing', `${this.mainClient.guilds.cache.size} servers`);
            embed.addField('Total Guild Count', `${this.getModule('common').serverCount}`);
        }

        this.send(embed);
    }
}
