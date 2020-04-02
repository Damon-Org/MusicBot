const BasicCommand = require('../../util/basic_command.js');

/**
 * @category Commands
 * @extends Command
 */
class Invite extends BasicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
            category: category,

            name: 'invite',
            aliases: [],
            description: 'Invite Damon to your Discord server.',
            usage: 'invite',
            params: [],
            examples: []
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    run(command) {
        const
            embed = new this.db.Discord.MessageEmbed()
            .setAuthor(`Made by ${this.db.creator.tag}`, this.db.creator.avatarURL)
            .setDescription(`Click [here](https://discordapp.com/oauth2/authorize?&client_id=${this.db.client.user.id}&scope=bot&permissions=${this.db.config.permission_bit}) to invite`)
            .setColor('#dd0a35')
            .setFooter('Powered by the 🔥 of the gods');

        this.textChannel.send(embed);
    }
}

module.exports = Invite;
