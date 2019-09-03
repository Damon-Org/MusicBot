const
    Choice = require('./music/choice.js'),
    MusicSystem = require('./music/system.js');

module.exports = class Server {
    /**
     * @constructs
     * @param {MusicBot} musicBot MusicBot instance
     * @param {string|number} serverId A string or number that identifies a guild
     */
    constructor(musicBot, serverId) {
        this.musicBot = musicBot;

        this.id = serverId;

        this.musicSystem = new MusicSystem(musicBot, this);
        // a Map of {Discord.User: Choice}
        this.choices = new Map();
        this.playlists = new Map();
    }

    async addChoice(requester, searchFor, exception) {
        const choice = new Choice(searchFor, exception);

        choice.setRequester(requester);

        this.choices.set(requester.user.id, choice);
        return await choice.getSongs();
    }

    async getLockedChannels() {
        if (this.lockedChannel == undefined) {
            const music = await this.musicBot.serverUtils.getGuildOption(this.id, 1);

            this.lockedChannel = {
                music: music
            };
        }

        return this.lockedChannel;
    }
}
