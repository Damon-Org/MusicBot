const
    Choice = require('../music/choice'),
    MusicSystem = require('../music/system'),
    RecordingSystem = require('../recording/system');

/**
 * Each guild that activily uses the bot will have this class initialized
 * @category Classes
 */
class Server {
    /**
     * @constructs
     * @param {MusicBot} musicBot
     * @param {external:Discord_Guild} guild
     */
    constructor(musicBot, guild) {
        /**
         * @type {MusicBot}
         */
        this.musicBot = musicBot;

        /**
         * @type {external:Discord_Guild}
         */
        this.guild = guild;
        /**
         * The guild id
         * @type {external:Number}
         */
        this.id = guild.id;

        /**
         * @type {MusicSystem}
         * @readonly
         */
        this.musicSystem = new MusicSystem(musicBot, this);
        /**
         * @type {RecordingSystem}
         * @readonly
         */
        this.recordingSystem = new RecordingSystem(musicBot, this);

        /**
         * a Map of {"Discord_User_id": Choice instance}
         * @type {external:Map}
         */
        this.choices = new Map();
        /**
         * @type {external:Map}
         */
        this.playlists = new Map();
    }

    /**
     * This function will add an user MusicChoice to the server instance
     * @param {external:Discord_GuildMember} requester
     * @param {external:String} searchFor
     * @param {external:Boolean} exception If the song should be added next up
     * @returns {external:Boolean} Returns false if no songs were found, true otherwise
     */
    async addChoice(requester, searchFor, exception) {
        const choice = new Choice(searchFor, exception);

        choice.setRequester(requester);

        const oldChoice = this.choices.get(requester.user.id);
        if (oldChoice && oldChoice.listener) {
            oldChoice.listener.delete();
        }

        this.choices.set(requester.user.id, choice);
        return await choice.getSongs();
    }

    /**
     * This function will update the locked channels of a guild if not yet cached
     * @returns {external:Object} Returns an object of possible locked channels in X Guild, if no channel exists it'll return null
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

    /**
     * Tries to fetch server its custom prefix, if null returns the bot's default prefix
     * @returns {external:String} The server prefix
     */
    async getPrefix() {
        if (!this.prefix) {
            this.prefix = await this.musicBot.serverUtils.getGuildOption(this.id, 2);
            if (!this.prefix || this.prefix == '') {
                this.prefix = this.musicBot.config.development ? this.musicBot.config.default_prefix.dev : this.musicBot.config.default_prefix.prod;
            }
        }

        return this.prefix;
    }

    /**
     * Sets the bot's prefix in memory, this function will also update the prefix in the database
     * @param {external:String} new_prefix The new server prefix to be used
     */
    async setPrefix(new_prefix) {
        await this.musicBot.serverUtils.updateGuildOption(this.id, 'guildPrefix', new_prefix);

        this.prefix = new_prefix;
    }
}

module.exports = Server;
