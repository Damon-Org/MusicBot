import DJCommand from '../../../structures/commands/DJCommand.js'

export default class DJMode extends DJCommand {
    /**
     * @param {string} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(DJMode, {
            category: category,
            guild_only: true,

            name: 'mode',
            aliases: [],
            description: 'Change the DJ mode.',
            usage: 'dj mode <# mode>',
            params: [
                {
                    name: 'mode',
                    description: 'The new mode to be used for DJ\'s',
                    type: 'number',
                    required: true
                }
            ],
            example: 'dj mode FREEFORALL'
        });
    }

    /**
     * @param {string} command string representing what triggered the command
     */
    async run(command) {
        if (!this.voiceChannel) {
            this.reply('where are you? I can\'t seem to find you in any voice channel. <:thinking_hard:560389998806040586>')
                .then(msg => msg.delete({timeout: 5e3}));

            return;
        }

        if (!this.music.isDamonInVC(this.voiceChannel)) {
            this.reply('you aren\'t in my voice channel! 😣')
                .then(msg => msg.delete({timeout: 5e3}));

            return;
        }

        if (!this.music.queueExists()) {
            this.send('The DJ mode can only be changed while music is playing.')
                .then(msg => msg.delete({timeout: 5e3}));

            return;
        }

        const mode = this.mode[this.args[0].toUpperCase()];
        if (mode) {
            if (this.elevated || mode == this.mode['FREEFORALL']) {
                this.dj.setMode(mode);

                this.send(`Changed DJ mode to \`${this.args[0].toUpperCase()}\``);

                return;
            }
            this.reply(`as managed DJ you can not switch to \`${this.args[0].toUpperCase()}\`.`);

            return;
        }

        this.send(`Unknown DJ mode, use \`${this.server.prefix}dj info\` to get more information around the DJ system.`)
            .then(msg => msg.delete({timeout: 5e3}));
    }
}
