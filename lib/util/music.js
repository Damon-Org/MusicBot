module.exports = class MusicUtils {
    /**
     * @constructs
     * @param {MusicBot} musicBot MusicBot instance
     */
    constructor(musicBot) {
        this.musicBot = musicBot;
    }

    isValidDomain(possibleDomain) {
        try {
            const url = new URL(possibleDomain);

            return [true, url.pathname];
        } catch (e) {
            return [false, null];
        }
    }
}
