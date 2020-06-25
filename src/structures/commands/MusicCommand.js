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

        return true;
    }
}
