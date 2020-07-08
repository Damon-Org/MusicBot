import BaseModule from '../structures/modules/BaseModule.js'

export default class EventExtender extends BaseModule {
    constructor(mainClient) {
        super(mainClient);

        this.register(EventExtender, {
            name: 'eventExtender'
        });

        this._eventReferences = {};

        this._voiceChannels = new Map();
    }

    cleanup() {
        for (const prop in this._eventReferences)
            if (this._eventReferences.hasOwnProperty(prop))
                this.mainClient.off(prop, this._eventReferences[prop]);
    }

    setup() {
        this.mainClient.on('messageReactionAdd', this._eventReferences['add'] = (messageReaction, user) => this._reactionEvent('add', messageReaction, user));
        this.mainClient.on('messageReactionRemove', this._eventReferences['remove'] = (messageReaction, user) => this._reactionEvent('remove', messageReaction, user));

        this.mainClient.on('voiceStateUpdate', this._eventReferences['voiceState'] = (oldState, newState) => this._voiceStateEvent(oldState, newState));
    }

    /**
     * This method will extend the messageReaction events and emit additional listeners add/remove/toggle
     * @private
     * @param {String} type The reaction event type "add" or "remove"
     * @param {MessageReaction} messageReaction
     * @param {User} user The user that initiated the reaction event
     */
    _reactionEvent(type, messageReaction, user) {
        this.mainClient.emit('reactionToggle', messageReaction, user);

        switch (type) {
            case 'add': {
                this.mainClient.emit('reactionAdd', messageReaction, user);
                break;
            }
            case 'remove': {
                this.mainClient.emit('reactionAdd', messageReaction, user);
                break;
            }
        }
    }

    _voiceStateEvent(oldState, newState) {
        const
            guild = oldState.member.guild || newState.member.guild,
            serverMember = oldState.member || newState.member,
            voiceChannel = oldState.channel || newState.channel;

        this.mainClient.emit('voiceUpdate', guild, serverMember, voiceChannel);

        if (!this._voiceChannels.has(voiceChannel.id)) this._voiceChannels.set(voiceChannel.id, 0);
        const vcPreviousSize = this._voiceChannels.get(voiceChannel.id);

        if (!oldState || vcPreviousSize < voiceChannel.members.size) {
            this._voiceChannels.set(voiceChannel.id, voiceChannel.members.size);

            this.mainClient.emit('voiceJoin', guild, serverMember, voiceChannel);
        }
        else if (vcPreviousSize > voiceChannel.members.size) {
            this._voiceChannels.set(voiceChannel.id, voiceChannel.members.size);

            this.mainClient.emit('voiceLeave', guild, serverMember, voiceChannel);
        }

        if (voiceChannel.members.size == 0) {
            this._voiceChannels.delete(voiceChannel.id);
        }
    }
}
