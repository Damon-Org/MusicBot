const DJCommand = require('../../structs/dj_command');

/**
 * @category Commands
 * @extends DJCommand
 */
class DJLock extends DJCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(DJLock, {
            category: category,
            guild_only: true,

            name: 'dj lock',
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
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        if (!this.voiceChannel) {
            this.reply('where are you? I can\'t seem to find you in any voice channel. <:thinking_hard:560389998806040586>')
                .then(msg => msg.delete({timeout: 5e3}));

            return;
        }

        if (!this.musicSystem.queueExists()) {
            this.reply('tell me to play some music for you before using this command. 🎵')
                .then(msg => msg.delete({timeout: 5e3}));

            return;
        }

        if (!this.musicSystem.isDamonInVC(this.voiceChannel)) {
            this.reply('you aren\'t in my voice channel! 😣')
                .then(msg => msg.delete({timeout: 5e3}));

            return;
        }

        this.musicSystem.djManager.playlistLock = command === 'dj lock' ? true : false;
        if (command === 'dj lock') {
            this.send('I\'ve locked the playlist, only DJ\'s can add songs now.');

            return;
        }

        this.send('I\'ve unlocked the playlist, everyone can add songs again!');
    }
}

module.exports = DJLock;
