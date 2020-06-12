class MusicShutdown {
    constructor(musicSystem) {
        this.musicSystem = musicSystem;
    }

    cancel() {
        this.reset();

        this.shutdownMsg.then(msg => msg.delete());
    }

    delay(type, timeout) {
        if (this._timeout) clearTimeout(this._timeout);
        this._type = type;

        if (type == 'time')
            this.shutdownMsg = this.musicSystem.channel.send('The queue will be destroyed within 5 minutes, rejoin within that time to resume music playback.');

        this._timeout = setTimeout(() => {
            this.instant();
        }, timeout);
    }

    instant() {
        this.reset();

        this.musicSystem.disconnect();
        this.musicSystem.reset();
    }

    type() {
        if (this._type == null) return false;
        return this._type;
    }

    reset() {
        if (this._timeout) clearTimeout(this._timeout);

        this._timeout = null;
        this._type = null;
    }
}

module.exports = MusicShutdown;
