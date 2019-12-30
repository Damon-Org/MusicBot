module.exports = class Track {
    /**
     * @constructs
     * @param {Object} data Data found by the LavaLink REST APi
     */
    constructor(data) {
        this.id = data.info.identifier;

        this.author = data.info.author;
        this.title = data.info.title;

        this.isStream = data.info.isStream;

        this.track = data.track;

        this.data = data;
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
}
