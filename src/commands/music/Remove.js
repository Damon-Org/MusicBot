import MusicCommand from '../../structures/commands/MusicCommand.js'

export default class Remove extends MusicCommand {
    /**
     * @param {String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(Remove, {
            category: category,
            guild_only: true,

            name: 'remove',
            aliases: [
                'rm',
                'remove song',
                'removesong'
            ],
            description: 'Remove a song by giving the number of the song in queue.',
            usage: 'remove [#queue-number]',
            params: [
                {
                    name: 'song-number',
                    description: 'Number of a song in queuer',
                    type: 'number',
                    default: 'Will remove the currently playing song from queue'
                }
            ],
            example: 'remove 3'
        });
    }

    /**
     * @param {String} command string representing what triggered the command
     */
    async run(command) {
        if (this.music.isDamonInVC(this.voiceChannel)) {
            if (this.music.removeSong(this.args[0])) {
                if (!this.args[0] || this.args[0] == '' || this.args[0] == 1) {
                    this.reply('the currently playing song has been removed.');

                    return true;
                }

                this.reply('the selected song has been removed.');

                return true;
            }

            this.reply(`invalid song number. \nThe number of the song has to exist in queue, check queue with ${this.server.prefix}q <# page number>.`)
                .then(msg => msg.delete({timeout: 5e3}));

            return true;
        }

        this.reply('you aren\'t in my voice channel! 😣')
            .then(msg => msg.delete({timeout: 5e3}));

        return true;
    }
}
