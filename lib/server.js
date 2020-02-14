const
    Choice = require('./music/choice.js'),
    MusicSystem = require('./music/system.js'),
    RecordingSystem = require('./recording/system.js');

/**
 * Each guild that activily uses the bot will have this class initialized
 */
class Server {
    /**
     * @constructs
     * @param {MusicBot} musicBot
     * @param {Discord.Guild} guild
     */
    constructor(musicBot, guild) {
        this.musicBot = musicBot;

        this.guild = guild;
        this.id = guild.id;

        this.musicSystem = new MusicSystem(musicBot, this);
        this.recordingSystem = new RecordingSystem(musicBot, this);

        // a Map of {Discord.User.id: Choice instance}
        this.choices = new Map();
        this.playlists = new Map();
    }

    /**
     * This function will add an user MusicChoice to the server instance
     * @param {Discord.GuildMember} requester
     * @param {String} searchFor
     * @param {Boolean} exception If the song should be added next up
     * @returns {Boolean} Returns false if no songs were found, true otherwise
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

    /**
     * Tries to fetch server its custom prefix, if null returns the bot's default prefix
     * @returns {String} The server prefix
     */
    async getPrefix() {
        if (!this.prefix) {
            this.prefix = await this.musicBot.serverUtils.getGuildOption(this.id, 2);
            if (!this.prefix || this.prefix == '') {
                this.prefix = this.musicBot.config.default_prefix;
            }
        }

        return this.prefix;
    }

    /**
     * Sets the bot's prefix in memory, this function will also update the prefix in the database
     */
    async setPrefix(new_prefix) {
        await this.musicBot.serverUtils.updateGuildOption(msgObj.guild.id, 'guildPrefix', newPrefix);

        this.prefix = new_prefix;
    }
}

module.exports = Server;
