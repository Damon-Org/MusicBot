const
    BotEvents = require('./events.js'),
    CommandRegisterer = require('../commands/command.js'),
    MusicSystem = require('../music/system.js');

module.exports = class MusicBot extends BotEvents {
    constructor(token) {
        super();

        this.login(token);

        this.startListeners();

        this.servers = new Map();

        this.commandRegisterer = new CommandRegisterer(this, './data/commands.json');
    }
}
