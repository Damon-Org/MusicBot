/**
 * @category Bot
 */
class BasicBot {
    constructor() {
        /**
         * @type {external:Discord}
         * @readonly
         */
        this.Discord = require('discord.js');

        /**
         * @type {external:Discord_Client}
         * @readonly
         */
        this.client = new this.Discord.Client();
    }

    /**
     * Start the bot with this token
     * @param {external:String}
     */
    login(token) {
        this.client.login(token);
    }

    /**
     * Properly destroy and exit the client
     */
    logout() {
        return this.client.destroy();
    }
}

module.exports = BasicBot;
