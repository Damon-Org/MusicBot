const Command = require('../../util/command.js');

/**
 * @category Commands
 * @extends Command
 */
class Help extends Command {
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
    onCommand(musicBot, msgObj, command, args) {
        const embed = new musicBot.Discord.MessageEmbed()
            .setTitle('Need help?')
            .setDescription('Damon site with a list of commands: https://music.damon.sh/\nVisit me in my [Discord server](https://discord.gg/EG4zHFR)')
            .setColor('#32cd32')
            .setFooter('Powered by the 🔥 of the gods');

        msgObj.channel.send(embed);
    }
}

module.exports = Help;
