const EventEmitter = require('events');

/**
 * Only extensions of original events should be added in this class
 * Offering more functionality/options over what discord.js vanilla events can do
 * @category Bot
 */
class CustomEvents {
    /**
     * @param {external:Discord_Client} client Discord.Client
     */
    constructor(client) {
        /**
         * @type {external:EventEmitter}
         * @readonly
         */
        this.reaction = new EventEmitter();

        /**
         * @type {external:Discord_Client}
         * @readonly
         */
        this.client = client;

        client.on('messageReactionAdd', (messageReaction, user) => this.handleReactionEvent('add', messageReaction, user));
        client.on('messageReactionRemove', (messageReaction, user) => this.handleReactionEvent('remove', messageReaction, user));
    }

    /**
     * This method will extend the messageReaction events and emit additional listeners add/remove/toggle
     * @param {external:String} type The reaction event type "add" or "remove"
     * @param {external:Discord_MessageReaction} messageReaction
     * @param {extenal:Discord_User} user The user that made the
     */
    handleReactionEvent(type, messageReaction, user) {
        if (user.id == this.client.user.id) {
            return;
        }

        this.reaction.emit('toggle', messageReaction, user);

        switch (type) {
            case 'add': {
                this.reaction.emit('add', messageReaction, user);
                break;
            }
            case 'remove': {
                this.reaction.emit('remove', messageReaction, user);
                break;
            }
        }
    }
}

module.exports = CustomEvents;
