const MusicAPI = new (require('./api.js'));

/**
 * @category MusicSystem
 */
class Choice {
    /**
     * @param {external:String} searchFor The string the bot has to search for on the youtube API
     * @param {external:Boolean} [exception=false] If the request should be added next up (true) or handle as a normal song (default=false)
     */
    constructor(searchFor, exception = false) {
        /**
         * @type {Array<*>}
         */
        this.rawData = [];
        /**
         * Holds the message on which we should listen for ChoiceReactions
         * @type {external:Discord_Message}
         */
        this.listener = null;
        /**
         * Holds the voicechannel the bot should join after a user has made its choice
         * @type {external:Discord_VoiceChannel}
         */
        this.voicechannel = null;
        /**
         * Holds the GuildMember that made the request for the song
         * @type {external:Discord_GuildMember}
         */
        this.requester = null;
        /**
         * @type {external:Boolean}
         */
        this.handled = false;

        /**
         * True if the track should be added next up in Queue, false if handled normally
         * @type {external:Boolean}
         */
        this.shouldPlayNext = exception;

        /**
         * The query that the choice class needs to search for
         * @type {external:String}
         */
        this.searchQuery = searchFor;
    }

    /**
     * Gets the generated embedDescription
     */
    getDescription() {
        if (!this.embedDescription) {
            return false;
        }

        return this.embedDescription;
    }

    /**
     * Will load the songs from the api and then generate an embedDescription
     */
    async getSongs() {
        const data = await MusicAPI.searchYoutube(this.searchQuery);

        if (data.length == 0) {
            return false;
        }

        /**
         * The embed description for the choice embed
         * @type {external:String}
         */
        this.embedDescription = '```asciidoc\n[CHOOSE A SONG]```\n'

        for (let i = 0; i < data.length; i++) {
            this.rawData[i] = data[i].id.videoId;

            this.embedDescription += `\`\`\`asciidoc\n[${(i + 1)}] :: ${data[i].snippet.title.replace('&#39;', '\'')}\`\`\``;
        }

        return true;
    }

    /**
     * Sets the message on which we have to listen for mention events
     * @param {external:Discord_Message} msgObj A Discord Message instance
     */
    setListener(msgObj) {
        this.listener = msgObj;
    }

    /**
     * Sets the requester of the choice
     * @param {Discord.GuildMember} requester A Discord GuildMember instance
     */
    setRequester(requester) {
        this.requester = requester;
    }

    /**
     * Sets the voicechannel of the requester
     * @param {Discord.VoiceChannel} voiceChannel A Discord VoiceChannel instance
     */
    setVoiceChannel(voiceChannel) {
        this.voicechannel = voiceChannel;
    }
}

module.exports = Choice;
