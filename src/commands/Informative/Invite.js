import Modules from '@/src/Modules.js'

export default class Invite extends Modules.commandRegistrar.BaseCommand {
    /**
     * @param {string} category
     * @param {Main} main
     */
    constructor(category, main) {
        super(main);

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
     * @param {string} trigger string representing what triggered the command
     */
    async run(trigger) {
        const creator = await this._m.users.fetch(this._m.config.creator);

        const embed = new this.Discord.MessageEmbed()
            .setAuthor(`Made by ${creator.tag}`)
            .setDescription(`Click [here](https://discordapp.com/oauth2/authorize?&client_id=${this._m.user.id}&scope=bot&permissions=${this._m.config.permission_bit}) to invite`)
            .setColor('#dd0a35')
            .setFooter('Powered by the 🔥 of the gods');

        this.sendEmbed(embed);

        return true;
    }
}
