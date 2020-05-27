const DJCommand = require('./dj_command');

class MusicCommand extends DJCommand {
    /**
     * @param {Array<*>} args
     */
    constructor(...args) {
        super(...args);
    }

    beforeRun(command) {
        if (!this.voiceChannel) {
            this.reply('where are you? I can\'t seem to find you in any voice channel. <:thinking_hard:560389998806040586>');

            return false;
        }

        return true;
    }
}

module.exports = MusicCommand;
