const MusicCommand = require('../../structs/music_command.js');

/**
 * @category Commands
 * @extends MusicCommand
 */
class Previous extends MusicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(Previous, {
            category: category,
            guild_only: true,

            name: 'previous',
            aliases: [
                'back'
            ],
            description: 'Will start playing the previous song in queue.',
            usage: 'previous',
            params: [],
            example: 'previous'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        if (this.musicSystem.isDamonInVC(this.voiceChannel)) {
            this.musicSystem.playPrevious();

            this.msgObj.react('⏮️');

            return true;
        }

        this.reply('you aren\'t in my voice channel! 😣')
            .then(msg => msg.delete({timeout: 5e3}));
    }
}

module.exports = Previous;
