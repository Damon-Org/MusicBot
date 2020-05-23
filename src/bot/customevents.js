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
         * @type {external:EventEmitter}
         */
        this.voice = new EventEmitter();

        this.voiceChannels = {};

        /**
         * @type {external:Discord_Client}
         * @readonly
         */
        this.client = client;

        client.on('messageReactionAdd', (messageReaction, user) => this.handleReactionEvent('add', messageReaction, user));
        client.on('messageReactionRemove', (messageReaction, user) => this.handleReactionEvent('remove', messageReaction, user));

        client.on('voiceStateUpdate', (oldState, newState) => this.handleVoiceStateEvent(oldState, newState));
    }

    /**
     * This method will extend the messageReaction events and emit additional listeners add/remove/toggle
     * @param {external:String} type The reaction event type "add" or "remove"
     * @param {external:Discord_MessageReaction} messageReaction
     * @param {extenal:Discord_User} user The user that made the
     */
    handleReactionEvent(type, messageReaction, user) {
        if (user.bot) return;

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

    handleVoiceStateEvent(oldState, newState) {
        const
            guild = oldState.member.guild || newState.member.guild,
            serverMember = oldState.member || newState.member,
            voiceChannel = oldState.channel || newState.channel;

        this.voice.emit('update', guild, serverMember, voiceChannel);

        if (!this.voiceChannels[voiceChannel.id]) this.voiceChannels[voiceChannel.id] = 0;

        if (!oldState || !this.voiceChannels[voiceChannel.id] || this.voiceChannels[voiceChannel.id] < voiceChannel.members.size) {
            this.voiceChannels[voiceChannel.id] = voiceChannel.members.size;

            this.voice.emit('join', guild, serverMember, voiceChannel);
        }
        else if (this.voiceChannels[voiceChannel.id] && this.voiceChannels[voiceChannel.id] > voiceChannel.members.size) {
            this.voiceChannels[voiceChannel.id] = voiceChannel.members.size;

            this.voice.emit('leave', guild, serverMember, voiceChannel);
        }
    }
}

module.exports = CustomEvents;
