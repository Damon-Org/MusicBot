const
    BasicBot = require('./base.js'),
    CustomEvents = require('./customevents.js');

// self is used instead of this as "this" loses its instance when called as an ES6 function
let self = null;
module.exports = class BotEvents extends BasicBot {
    constructor() {
        super();
    }

    startListeners() {
        self = this;
        self.customEvent = new CustomEvents(self.client);

        self.client.on('ready', self.ready);

        self.client.on('message', self.onMsg);

        self.customEvent.reaction.on('toggle', (messageReaction, user) => self.reactionToggleEvents(messageReaction, user));
    }

    /**
     * @param {Discord.Message} msgObj Discord.js Message Class instance
     */
    onMsg(msgObj) {
        if (!self.commandRegisterer.checkMessage(msgObj)) {
            // Message is not a command
        }
    }

    /**
     * @param {Discord.MessageReaction} messageReaction
     * @param {Discord.User} user
     */
    reactionToggleEvents(messageReaction, user) {
        const emoji = messageReaction.emoji.name;

        if (['⏮', '⏸', '⏭', '🔁'].includes(emoji)) {
            if (!messageReaction.message.member) {
                // The MessageReaction did not happen inside a Guild in that case we ignore it
                return;
            }

            const
                msgObj = messageReaction.message,
                serverId = msgObj.guild.id,
                serverInstance = this.serverUtils.getClassInstance(serverId);

            serverInstance.musicSystem.onMusicPlayerAction(emoji, msgObj, user);

            return;
        }
    }

    ready() {
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
