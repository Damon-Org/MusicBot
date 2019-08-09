const BasicBot = require('./base.js');

// self is used instead of this as "this" loses its instance when called as an ES6 function
let self = null;
module.exports = class BotEvents extends BasicBot {
    constructor() {
        super();
    }

    startListeners() {
        self = this;

        self.client.on('ready', self.ready);

        // Bot receives a message, this event is directly passed to the HasCommand function to check for a valid command syntax
        self.client.on('message', self.onMsg);
    }

    /**
     * @param {Discord.Message} msg Discord.js Message Class instance
     */
    onMsg(msg) {
        // Check if message is a possible command
        if (!self.commandRegisterer.checkMessage(msg)) {
            // Message is not a command
        }
    }

    async ready() {
        self.client.user.setPresence({
            game: {
                name: 'Yimura pull his hair of his head',
                type: 'WATCHING',
                url: 'https://www.twitch.tv/yimura_'
            }
        });

        console.log(`Shard #${self.client.shard.id + 1} took ${Date.now() - self.bootUp}ms to setup.`);

        const servers = self.client.guilds;
        for (let server of servers) {
            self.serverUtils.addGuildIfNotExists(server[1]);
        }
    }
}
