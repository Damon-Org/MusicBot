import MusicCommand from '../../structures/commands/MusicCommand.js'

export default class Restart extends MusicCommand {
    /**
     * @param {String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(Restart, {
            category: category,
            guild_only: true,

            name: 'restart',
            aliases: [],
            description: 'The queue will be rewinded to the start.',
            usage: 'leave',
            params: [],
            example: 'restart'
        });
    }

    /**
     * @param {String} command string representing what triggered the command
     */
    async run(command) {
        if (this.music.isDamonInVC(this.voiceChannel) && this.music.queueExists()) {
            this.send('The queue has been reset to the start.');

            this.music.queue.rewind();
            this.music.doNotSkip = true;

            this.music.repeat = false;

            if (this.music.shutdown.type() == 'leave') {
                this.music.shutdown.cancel();
                this.music.playNext();

                return true;
            }
            if (!await this.music.player.stopTrack()) this.music.soundEnd();

            return true;
        }

        this.reply('you aren\'t in my voice channel or I\'m not done playing music! 😣')
            .then(msg => msg.delete({timeout: 5e3}));

        return true;
    }
}
