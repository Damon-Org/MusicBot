import BaseCommand from './BaseCommand.js'

export default class MusicCommand extends BaseCommand {
    constructor(...args) {
        super(...args);
    }

    get music() {
        return this.server.music;
    }

    beforeRun(command) {
        if (!this.voiceChannel) {
            this.send('Please join a voice channel before using this command!');

            return false;
        }

        if (this.music.queueExists()) {
            const voiceChannel = this.music.voiceChannel;
            if (!voiceChannel) {
                this.music.reset();

                return true;
            }

            if (!this.music.isDamonInVC(voiceChannel)) {
                this.music.reset();

                return true;
            }

            if (voiceChannel.members.size === 1) {
                this.music.reset();
            }
        }

        return true;
    }
}
