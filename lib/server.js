const
    Choice = require('./music/choice.js'),
    MusicSystem = require('./music/system.js');

module.exports = class Server {
    /**
     * @constructs
     * @param {MusicBot} musicBot
     * @param {string|number} serverId A string or number that identifies a guild
     */
    constructor(musicBot, serverId) {
        this.musicBot = musicBot;

        this.id = serverId;

        this.musicSystem = new MusicSystem(musicBot, this);

        // a Map of {Discord.User.id: Choice instance}
        this.choices = new Map();
        this.playlists = new Map();
    }

    /**
     * @param {Discord.GuildMember} requester
     * @param {String} searchFor
     * @param {Boolean} exception If the song should be added next up
     */
    async addChoice(requester, searchFor, exception) {
        const choice = new Choice(searchFor, exception);

        choice.setRequester(requester);

        this.choices.set(requester.user.id, choice);
        return await choice.getSongs();
    }

    /**
     * @returns {Object} Returns an object of possible locked channels in X Guild, if no channel exists it'll return null
     */
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
