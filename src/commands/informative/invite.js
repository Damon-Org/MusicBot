const BasicCommand = require('../../util/basic_command.js');

/**
 * @category Commands
 * @extends Command
 */
class Invite extends BasicCommand {
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
        const
            embed = new this.musicBot.Discord.MessageEmbed()
            .setAuthor(`Made by ${this.musicBot.creator.tag}`, this.musicBot.creator.avatarURL)
            .setDescription(`Click [here](https://discordapp.com/oauth2/authorize?&client_id=${this.musicBot.client.user.id}&scope=bot&permissions=1278602576) to invite`)
            .setColor('#dd0a35')
            .setFooter('Powered by the 🔥 of the gods');

        this.textChannel.send(embed);
    }
}

module.exports = Invite;
