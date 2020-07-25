import BaseCommand from '../../../structures/commands/BaseCommand.js'

export default class DJInfo extends BaseCommand {
    /**
     * @param {String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(DJInfo, {
            category: category,
            guild_only: true,

            name: 'info',
            aliases: [],
            description: 'Shows some information about the DJ system and which modes exists.',
            usage: 'dj info',
            params: [],
            example: 'dj info'
        });
    }

    /**
     * @param {String} command string representing what triggered the command
     */
    async run(command) {
        const embed = new this.Discord.MessageEmbed()
            .setTitle('DJ System Information')
            .setDescription(
`Why use the DJ System?
What benefits does it have?
The DJ Systems is used to limit access to Music commands.
This means that trolls, people with ill intent, etc..., are unable to use commands that could possibly disrupt the flow of the music experience.
You can enable the DJ system with \`${this.server.prefix}dj enable\`.
This will put the DJ System in the \`MANAGED\` mode, there are 3 DJ modes.\nThe following modes exist:
\`\`\`- MANAGED: People with the "DJ" role and people that started the queue/are added by the DJ can use Music Commands
- ROLE: Only people with the "DJ" role can use Music Commands
- FREEFORALL: Anyone can use Music Commands\`\`\`You can switch between these modes with \`${this.server.prefix}dj mode <MODE>\` (remove the < >), as managed DJ you can only switch to \`FREEFORALL\`.
As server manager you can use the \`${this.server.prefix}dj modepersist <MODE>\` to make the \`MODE\` stay permanently like that.
Normal users can still add to the playlist but the DJ can disable this by using the \`${this.server.prefix}dj lock\` command or \`${this.server.prefix}dj unlock\` to unlock the queue again.
To disable the DJ system again use \`${this.server.prefix}dj disable\`.
People with the \`MANAGE_GUILD\` permission can bypass all limitations imposed by the DJ System.`
            )
            .setColor('#42069B');

        this.send(embed);

        return true;
    }
}
