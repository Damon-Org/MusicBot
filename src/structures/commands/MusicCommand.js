import DJCommand from './DJCommand.js'

export default class MusicCommand extends DJCommand {
    constructor(main) {
        super(main);
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
