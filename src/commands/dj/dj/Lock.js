import DJCommand from '../../../structures/commands/DJCommand.js'

export default class DJLock extends DJCommand {
    /**
     * @param {string} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(DJLock, {
            category: category,
            guild_only: true,

            name: 'lock',
            aliases: [
                'unlock'
            ],
            description: 'Lock the playlist from being modified by non DJ users.',
            usage: 'dj lock',
            params: [],
            example: 'dj lock'
        });
    }

    /**
     * @param {string} command string representing what triggered the command
     */
    async run(command) {
        if (!this.voiceChannel) {
            this.reply('where are you? I can\'t seem to find you in any voice channel. <:thinking_hard:560389998806040586>')
                .then(msg => msg.delete({timeout: 5e3}));

            return true;
        }

        if (!this.music.active()) {
            this.reply('tell me to play some music for you before using this command. 🎵')
                .then(msg => msg.delete({timeout: 5e3}));

            return true;
        }

        if (!this.music.isDamonInVC(this.voiceChannel)) {
            this.reply('you aren\'t in my voice channel! 😣')
                .then(msg => msg.delete({timeout: 5e3}));

            return true;
        }

        this.dj.playlistLock = command === 'dj lock' ? true : false;
        if (command === 'dj lock') {
            this.send('I\'ve locked the playlist, only DJ\'s can add songs now.');

            return true;
        }

        this.send('I\'ve unlocked the playlist, everyone can add songs again!');

        return true;
    }
}
