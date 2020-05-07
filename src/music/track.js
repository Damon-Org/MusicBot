/**
 * @category MusicSystem
 */
class Track {
    /**
     * @category MusicSystem
     * @param {external:Object} data Data found by the LavaLink REST APi
     */
    constructor(data) {
        this.id = data.info.identifier;

        this.author = data.info.author;
        this.title = data.info.title;
        this.uri = data.info.uri;

        this.isStream = data.info.isStream;

        this.track = data.track;

        this.data = data;
    }

    /**
     * Retrieves the song's title
     * @returns {external:String} Song Title
     */
    getTitle() {
        return this.title;
    }

    /**
     * Will set the requester of the song
     * @param {external:Discord_GuildMember} serverMember A Discord.GuildMember instance
     */
    setRequester(serverMember) {
        this.requester = serverMember;
    }
}

module.exports = Track;
