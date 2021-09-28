import Modules from '@/src/Modules.js'

export default class Help extends Modules.commandRegistrar.BaseCommand {
    /**
     * @param {string} category
     * @param {Main} main
     */
    constructor(category, main) {
        super(main);

        this.register(Help, {
            category: category,

            name: 'help',
            aliases: [
                'h'
            ],
            description: 'Gives a link to a website where you can find all the information you need.',
            usage: 'help',
            params: [
                {
                    name: 'name',
                    description: 'The command name for which you require more information.',
                    type: 'string',
                    default: null,
                    is_sentence: true
                }
            ],
            example: 'help'
        });
    }

    /**
     * @param {String} trigger string representing what triggered the command
     */
    run(trigger) {
        const name = this.get('name');
        if (!name) {
            const embed = new this.Discord.MessageEmbed()
                .setTitle('Need help?')
                .setDescription('Damon site with a list of commands: https://music.damon.sh/\nVisit me in my [Discord server](https://discord.gg/EG4zHFR)')
                .setColor('#32cd32')
                .setFooter('Powered by the 🔥 of the gods');

            this.sendEmbed(embed);

            return true;
        }

        const command = this.modules.commandRegistrar.get(name);
        if (!command) {
            this._argumentValidationError(`Unknown command given: ${name}`);

            return true;
        }

        command._msg = this.msgObj;
        command._argumentValidationError(`Documentation for "${name}"`);

        return true;
    }
}
