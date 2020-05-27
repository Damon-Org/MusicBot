const MusicCommand = require('../../structs/music_command.js');

/**
 * @category Commands
 * @extends MusicCommand
 */
class Skip extends MusicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(Skip, {
            category: category,
            guild_only: true,

            name: 'skip',
            aliases: [
                'next',
                's'
            ],
            description: 'Will skip the currently playing song.',
            usage: 'skip',
            params: [],
            example: 'skip'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        if (this.musicSystem.isDamonInVC(this.voiceChannel)) {
            this.msgObj.react('⏭');

            if (!await this.musicSystem.player.stopTrack()) this.musicSystem.soundEnd();

            return true;
        }

        this.reply('you aren\'t in my voice channel! 😣')
            .then(msg => msg.delete({timeout: 5e3}));

        return true;
    }
}

module.exports = Skip;
