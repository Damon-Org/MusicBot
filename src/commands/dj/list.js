const BaseCommand = require('../../structs/base_command');

/**
 * @category Commands
 * @extends BaseCommand
 */
class DJList extends BaseCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(DJList,{
            category: category,
            guild_only: true,

            name: 'dj list',
            aliases: [],
            description: 'Shows a list of all users that are currently DJ.',
            usage: 'dj list',
            params: [],
            example: 'dj list'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        if (!this.voiceChannel) {
            this.reply('where are you? I can\'t seem to find you in any voice channel. <:thinking_hard:560389998806040586>')
                .then(msg => msg.delete({timeout: 5e3}));

            return;
        }

        if (!this.musicSystem.isDamonInVC(this.voiceChannel)) {
            this.reply('you aren\'t in my voice channel! 😣')
                .then(msg => msg.delete({timeout: 5e3}));

            return;
        }

        if (this.musicSystem.djManager.size == 0) {
            this.send('There appear to be no active DJ\'s. <:thinking_hard:560389998806040586>');

            return;
        }

        const embed = new this.db.Discord.MessageEmbed()
            .setTitle('Active DJ users');

        let description = '';
        for (let dj of this.musicSystem.djManager.values()) {
            if (description !== '') description += '\n';

            description += `- ${dj.member}`;
        }

        embed.setDescription(description);

        this.send(embed);
    }
}

module.exports = DJList;
