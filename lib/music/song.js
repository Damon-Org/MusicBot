const API = require('./api.js');

module.exports = class Song {
    /**
     * @constructs
     * @param {string|number} id A string or number that can uniquely identify the
     * @param {string} source A unique string identifier this can be (yt: youtube, sc: soundcloud)
     */
    constructor(id, source, list = null) {
        this.id = id;
        this.source = source;
        this.list = list;

        this.length = 0;
        this.requester = null;

        this.author = null;
        this.title = null;
        this.thumbnail = null;
        this.viewcount = null;
    }

    /**
     * @param {Song} song A Song instance
     * @returns {Boolean} Compares two Songs and returns true if they match
     */
    equals(song) {
        if (this.id == song.id && this.source == song.source) {
            return true;
        }

        return false;
    }

    /**
     * Retrieves the song's title
     * @returns {String} Song Title
     */
    getTitle() {
        return this.title;
    }

    /**
     * Will set the requester of the song
     * @param {Discord.GuildMember} serverMember A Discord.GuildMember instance
     */
    setRequester(serverMember) {
        this.requester = serverMember;
    }

    /**
     * Will use the API to get this song its information.
     */
    async updateInformation() {
        switch (this.source) {
            case 'yt': {
                const data = await API.searchYoutube(this.id);
                console.log(data);

                break;
            }
            default: {
                this.author = 'Unknow author';
                this.title = 'Unknow song';
                this.viewcount = 'API Error';
            }
        }
    }
}
