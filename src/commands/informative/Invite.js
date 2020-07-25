import BaseCommand from '../../structures/commands/BaseCommand.js'

export default class Invite extends BaseCommand {
    /**
     * @param {String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(Invite, {
            category: category,

            name: 'invite',
            aliases: [
                'inv'
            ],
            description: 'Invite Damon to your Discord server.',
            usage: 'invite',
            params: [],
            example: 'invite'
        });
    }

    /**
     * @param {String} command string representing what triggered the command
     */
    run(command) {
        const
            embed = new this.Discord.MessageEmbed()
            .setAuthor(`Made by ${this.mainClient.config.creator}`)
            .setDescription(`Click [here](https://discordapp.com/oauth2/authorize?&client_id=${this.mainClient.user.id}&scope=bot&permissions=${this.mainClient.config.permission_bit}) to invite`)
            .setColor('#dd0a35')
            .setFooter('Powered by the 🔥 of the gods');

        this.send(embed);
    }
}
