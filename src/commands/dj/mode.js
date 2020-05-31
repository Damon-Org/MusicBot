const
    DJCommand = require('../../structs/dj_command'),
    MODE = require('../../music/dj/mode');

/**
 * @category Commands
 * @extends Command
 */
class DJMode extends DJCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(DJMode, {
            category: category,
            guild_only: true,

            name: 'dj mode',
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
            example: 'dj mode 3'
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

        if (!this.musicSystem.queueExists()) {
            this.send('The DJ mode can only be changed while music is playing.')
                .then(msg => msg.delete({timeout: 5e3}));

            return;
        }

        const mode = MODE[this.args[0].toUpperCase()];
        if (mode) {
            if (this.elevated || mode == MODE['FREEFORALL']) {
                this.musicSystem.djManager.setMode(mode);

                this.send(`Changed DJ mode to \`${this.args[0].toUpperCase()}\``);

                return;
            }
            this.reply(`as managed DJ you can not switch to \`${this.args[0].toUpperCase()}\`.`);

            return;
        }

        this.send(`Unknown DJ mode, use \`${this.serverInstance.prefix}dj info\` to get more information around the DJ system.`)
            .then(msg => msg.delete({timeout: 5e3}));
    }
}

module.exports = DJMode;
