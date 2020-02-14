const EventEmitter = require('events');

class CustomEvents {
    constructor(client) {
        this.reaction = new EventEmitter();

        this.client = client;

        client.on('messageReactionAdd', (messageReaction, user) => this.handleReactionEvent('add', messageReaction, user));
        client.on('messageReactionRemove', (messageReaction, user) => this.handleReactionEvent('remove', messageReaction, user));
    }

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
