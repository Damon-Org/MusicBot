const
    Command = require('../../util/command.js'),
    humanReadableTime = require('humanize-duration');

/**
 * @category Commands
 * @extends Command
 */
class Stats extends Command {
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
        const embed = new musicBot.Discord.MessageEmbed()
            .setTitle('Statistics? Stats? Mmmm whatever...')
            .addField('Uptime', humanReadableTime(Math.round((Date.now() - musicBot.bootUp) / 1000) * 1000))
            .addField('Active Music Players', musicBot.carrier.totalPlayers)
            .addField('Bot Version', `v${global.version}`)
            .addField('Environment Version', `Node ${process.version}`)
            .addField('Created by', musicBot.creator.tag);

        if (musicBot.client.shard.count <= 1) {
            embed.addField('Total Guild Count', musicBot.client.guilds.size);
        }
        else {
            embed.addField('This instance is managing', `${musicBot.client.guilds.size} servers`);
            embed.addField('Total Guild Count', `${musicBot.totalServerCount}`)
        }

        msgObj.channel.send(embed);
    }
}

module.exports = Stats;
