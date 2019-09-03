const
    API = new (require('./api.js')),
    Song = require('./song.js');

module.exports = class Choice {
    constructor(searchFor, exception = false) {
        this.songs = [];
        this.listener = null;
        this.voicechannel = null;
        this.requester = null;

        this.shouldPlayNext = exception;

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
        const data = await API.searchYoutube(this.searchQuery);

        if (data.length == 0) {
            return false;
        }

        this.embedDescription = '```asciidoc\n[CHOOSE A SONG]```\n'

        for (let i = 0; i < data.length; i++) {
            this.songs[i] = new Song(data[i].id.videoId, 'yt');

            this.embedDescription += `\`\`\`asciidoc\n[${(i + 1)}] :: ${data[i].snippet.title}\`\`\``;
        }

        return true;
    }

    /**
     * Sets the message on which we have to listen for mention events
     * @param {Discord.Message} msgObj A Discord Message instance
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
