const
    fs = require('fs'),
    BotEvents = require('./events.js'),
    CommandRegisterer = require('../commands/command.js'),
    MusicSystem = require('../music/system.js');

module.exports = class MusicBot extends BotEvents {
    /**
     * @param {string} token A valid token so our Discord.client can login
     */
    constructor(token) {
        super();

        this.config = JSON.parse(fs.readFileSync('./data/config.json'));

        this.login(token);

        this.startListeners();

        this.servers = new Map();

        this.commandRegisterer = new CommandRegisterer(this, './data/commands.json');
    }
}
