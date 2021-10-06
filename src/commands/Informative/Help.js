import Modules from '@/src/Modules.js'
import { MessageEmbed, MessageButton, MessageActionRow } from 'discord.js'

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
     * @param {string} trigger string representing what triggered the command
     */
    run(trigger) {
        const name = this.get('name');
        if (!name) {
            const embed = new MessageEmbed()
                .setTitle('Need help?')
                .setDescription('Click one of the links below.')
                .setColor('#32cd32')
                .setFooter('Powered by the 🔥 of the gods');

            const siteButton = new MessageButton()
                .setLabel('Commands')
                .setStyle('LINK')
                .setURL('https://music.damon.sh');
            const discordButton = new MessageButton()
                .setLabel('Discord Server')
                .setStyle('LINK')
                .setURL('https://discord.gg/EG4zHFR');
            const component = new MessageActionRow()
                .addComponents(siteButton)
                .addComponents(discordButton);

            this.send({ embeds: [ embed ], components: [ component ] });

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
