import Modules from '@/src/Modules.js'
import humanReadableTime from 'humanize-duration'

export default class Stats extends Modules.commandRegistrar.BaseCommand {
    /**
     * @param {string} category
     * @param {Main} main
     */
    constructor(category, main) {
        super(main);

        this.register(Stats, {
            category: category,

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
     * @param {string} trigger string representing what triggered the command
     */
    async run(trigger) {
        const creator = await this._m.users.fetch(this._m.config.creator);

        const embed = new this.Discord.MessageEmbed()
            .setTitle('Statistics? Stats? Mmmm whatever...')
            .addField('Uptime', humanReadableTime(Math.round((Date.now() - this._m.bootUp) / 1000) * 1000))
            //.addField('Active Music Players', this.db.carrier.totalPlayers)
            .addField('Bot Version', this._m.version)
            .addField('Environment Version', `Node ${process.version}`)
            .addField('Created by', creator.tag);

        if (this._m.shard.count <= 1) {
            embed.addField('Total Guild Count', this._m.guilds.cache.size?.toString() || 'Unknown');
        }
        else {
            embed.addField('This instance is managing', `${this._m.guilds.cache.size} servers`);
            embed.addField('Total Guild Count', `${this.globalStorage.get('serverCount')?.toString() || 'Unknown'}`);
        }

        this.sendEmbed(embed);

        return true;
    }
}
