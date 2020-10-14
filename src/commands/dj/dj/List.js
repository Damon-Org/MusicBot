import BaseCommand from '../../../structures/commands/BaseCommand.js'

export default class DJList extends BaseCommand {
    /**
     * @param {String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(DJList,{
            category: category,
            guild_only: true,

            name: 'list',
            aliases: [],
            description: 'Shows a list of all users that are currently DJ.',
            usage: 'dj list',
            params: [],
            example: 'dj list'
        });

        const { DJMode } = this._m.modules.constants.dj;
        this.mode = DJMode;
    }

    get music() {
        return this.server.music;
    }

    /**
     * @param {String} command string representing what triggered the command
     */
    async run(command) {
        if (this.music.djManager.mode === this.mode['FREEFORALL']) {
            this.send('The DJ system is not active right now.')
                .then(msg => msg.delete({timeout: 5e3}));

            return true;
        }

        if (!this.voiceChannel) {
            this.reply('where are you? I can\'t seem to find you in any voice channel. <:thinking_hard:560389998806040586>')
                .then(msg => msg.delete({timeout: 5e3}));

            return true;
        }

        if (!this.music.isDamonInVC(this.voiceChannel)) {
            this.reply('you aren\'t in my voice channel! 😣')
                .then(msg => msg.delete({timeout: 5e3}));

            return true;
        }

        if (this.music.djManager.size == 0) {
            this.send('There appear to be no active DJ\'s. <:thinking_hard:560389998806040586>');

            return true;
        }

        const embed = new this.Discord.MessageEmbed()
            .setTitle('Active DJ users');

        let description = '';
        for (let dj of this.music.djManager.users.values()) {
            if (description !== '') description += '\n';

            description += `- ${dj.member}`;
        }

        embed.setDescription(description);

        this.send(embed);

        return true;
    }
}
