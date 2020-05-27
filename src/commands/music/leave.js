const DJCommand = require('../../structs/dj_command.js');

/**
 * @category Commands
 * @extends DJCommand
 */
class Leave extends DJCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(Leave, {
            category: category,
            guild_only: true,

            name: 'leave',
            aliases: [
                'quit',
                'exit',
                'stop'
            ],
            description: 'Bot will stop music playback and leave channel',
            usage: 'leave',
            params: [],
            example: 'leave'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        if (!this.voiceChannel && !this.musicSystem.shutdown.type()) {
            this.reply('where are you? I can\'t seem to find you in any voice channel. <:thinking_hard:560389998806040586>')
                .then(msg => msg.delete({timeout: 5e3}));

            return true;
        }

        if (this.musicSystem.isDamonInVC(this.voiceChannel) || this.musicSystem.shutdown.type()) {
            this.msgObj.react('👋');

            this.musicSystem.shutdown.instant();

            return true;
        }

        this.reply('you aren\'t in my voice channel! 😣').then(msg => msg.delete({timeout: 5e3}));

        return true;
    }
}

module.exports = Leave;
