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
    }

    /**
     * @param {external:String} name Constructive Name from where the log originated
     * @param {external:String} level Logging level, supported levels are INFO, WARN, ERROR, CRITICAL
     * @param {external:String} message The message to output
     * @param {external:Boolean} show_time By default true, shows the time in front of the log
     */
    log(name, level, message, show_time = true) {
        const
            level_types = ['INFO', 'WARN', 'ERROR', 'CRITICAL'],
            d = new Date();

        if (!level_types.includes(level.toUpperCase())) new Error('Unknown error logging level, \'' + level + '\'.');

        let
            log = show_time ? `[${d.toLocaleTimeString()}] ` : '',
            colours = ['', ''];

        switch (level.toUpperCase()) {
            case 'WARN':
                colours = ['\x1b[33m', '\x1b[0m']
                break;
            case 'ERROR':
            case 'CRITICAL':
                colours = ['\x1b[31m', '\x1b[0m']
                break;
        }

        console.log(`${log}${colours[0]}[${name}/${level.toUpperCase()}]${colours[1]} ${message}`);
    }

    /**
     * Start the bot with this token
     * @param {external:String}
     */
    login(token) {
        /**
         * @type {external:Discord_Client}
         * @readonly
         */
        this.client = new this.Discord.Client(this.config.client_options);

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
