const BasicCommand = require('../../util/basic_command.js');

/**
 * @category Commands
 * @extends Command
 */
class Help extends BasicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
            category: category,

            name: 'help',
            aliases: [
                'h'
            ],
            description: 'Gives a link to a website where you can find all the information you need.',
            usage: 'help',
            params: [],
            example: 'help'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    run(command) {
        const embed = new this.db.Discord.MessageEmbed()
            .setTitle('Need help?')
            .setDescription('Damon site with a list of commands: https://music.damon.sh/\nVisit me in my [Discord server](https://discord.gg/EG4zHFR)')
            .setColor('#32cd32')
            .setFooter('Powered by the 🔥 of the gods');

        this.textChannel.send(embed);
    }
}

module.exports = Help;
