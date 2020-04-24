class MusicShutdown {
    constructor(musicSystem) {
        this.musicSystem = musicSystem;
    }

    cancel() {
        this.reset();
    }

    delay(type, timeout) {
        if (this._timeout) clearTimeout(this._timeout);
        this._type = type;

        this._timeout = setTimeout(() => {
            this.reset();

            this.musicSystem.disconnect();
            this.musicSystem.reset();
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
