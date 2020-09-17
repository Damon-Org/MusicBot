import BaseModule from '../structures/modules/BaseModule.js'
import { MessageEmbed } from 'discord.js'

export default class Hinting extends BaseModule {
    /**
     * @param {MainClient} mainClient
     */
    constructor(mainClient) {
        super(mainClient);

        this.register(Hinting, {
            name: 'hinting',
            requires: ['commandRegistrar'],
            events: [
                {
                    mod: 'commandRegistrar',
                    name: 'command',
                    call: '_onCommand'
                }
            ]
        });
    }

    /**
     * @param {Object} commandRegistrar
     * @param {Message} message
     * @param {Array<string>} args
     * @param {boolean} mentioned
     */
    _onCommand(commandInstance, message, args, mentioned) {
        if (commandInstance.category === 'music') {
            const guildId = message.guild.id;

            const state = this.getModule('guildSetting').get(guildId, 'hintsDisabled');
            if (state == true) return;

            const server = this.servers.get(guildId);

            const lastTime = server.tempStorage.get('lastHint');
            if (lastTime && Date.now() - lastTime <= 1e7) return;

            const rand = Math.random();
            if (rand > 0.7) return;

            server.tempStorage.set('lastHint', Date.now());

            const commandList = this.getModule('commandRegistrar').commandList.getCategory('music');
            const commandName = commandList[Math.floor(Math.random() * commandList.length)];

            const instance = this.getModule('commandRegistrar').get(commandName);

            const embed = new MessageEmbed()
                .setTitle('Want a hint? Here you go.')
                .setDescription(
`Command Name: **${commandName}**

This command does the following:
\`\`\`${instance.description}\`\`\`
Usage:
\`\`\`${instance.usage}\`\`\`
Example:
\`\`\`${instance.example}\`\`\``)
                .setFooter(`Disable hints with: ${this.getModule('commandRegistrar').defaultPrefix}hints disable`)
                .setColor('#32cd32');

            message.channel.send(embed);
        }
    }

    setup() {

    }
}
