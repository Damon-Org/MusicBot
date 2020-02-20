const
    BasicCommand = require('../../util/basic_command.js'),
    humanReadableTime = require('humanize-duration');

/**
 * @category Commands
 * @extends Command
 */
class Stats extends BasicCommand {
    /**
     * @param {Array<*>} args
     */
    constructor(...args) {
        super(...args);
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    run(command) {
        const embed = new this.musicBot.Discord.MessageEmbed()
            .setTitle('Statistics? Stats? Mmmm whatever...')
            .addField('Uptime', humanReadableTime(Math.round((Date.now() - this.musicBot.bootUp) / 1000) * 1000))
            .addField('Active Music Players', this.musicBot.carrier.totalPlayers)
            .addField('Bot Version', `v${global.version}`)
            .addField('Environment Version', `Node ${process.version}`)
            .addField('Created by', this.musicBot.creator.tag);

        if (this.musicBot.client.shard.count <= 1) {
            embed.addField('Total Guild Count', this.musicBot.client.guilds.size);
        }
        else {
            embed.addField('This instance is managing', `${this.musicBot.client.guilds.size} servers`);
            embed.addField('Total Guild Count', `${this.musicBot.totalServerCount}`)
        }

        this.textChannel.send(embed);
    }
}

module.exports = Stats;
