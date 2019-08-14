const Song = require('../music/song.js');

module.exports = class MusicUtils {
    /**
     * @constructs
     * @param {MusicBot} musicBot MusicBot instance
     */
    constructor(musicBot) {
        this.musicBot = musicBot;
    }

    /**
     * @param {Song} song A Song instance
     */
    async checkBrokenSong(song) {
        // Wil return true no matter what as the api is not setup yet
        return true;
    }

    /**
     * This function will check if a domain is valid and supported in our system, if so it'll return a new Song()
     * @param {string} possibleDomain Value to check if valid domain
     * @returns {Array} Boolean value if succeeded and a new Song()
     */
    async isValidDomain(possibleDomain) {
        try {
            const
                url = new URL(possibleDomain),
                domain = url.hostname;

            let
                id = null,
                source = null;

            if (domain.includes('youtube') || domain.includes('youtu.be')) {
                source = 'yt';

                if (domain == 'youtu.be') {
                    id = url.pathname.split('/')[1];

                    if (id == '') {
                        id = null;
                    }
                }
                else {
                    const queryParams = url.searchParams;

                    id = queryParams.get('v');
                }
            }
            else if (domain.includes('soundcloud.com')) {
                // not yet supported
                return [4, null];
            }
            else {
                return [2, null];
            }

            if (id == undefined || id == null) {
                return [3, null];
            }

            const song = new Song(id, source);

            return [1, song];
        } catch (e) {
            if (e.code == 'ERR_INVALID_URL') {
                return [0, null];
            }

            return [5, e.stack];
        }
    }
}
