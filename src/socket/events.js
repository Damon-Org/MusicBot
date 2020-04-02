class SocketEvents {
    /**
     * @param {MusicBot} musicBot
     */
    constructor(musicBot) {
        /**
         * @type {MusicBot}
         */
        this.db = musicBot;
    }

    /**
     * @param {Connection} new_value
     */
    set eventListener(new_value) {
        this.connection = new_value;

        this.connection.on('socket_event', (request, socketMessage) => {
            try {
                this[request.name](socketMessage);
            } catch (e) {
                if (e.message.includes('is not a function')) {
                    socketMessage.rejected = 'unknown_command';
                    this.connection.send(socketMessage);

                    return;
                }

                socketMessage.rejected = 'stack';
                socketMessage.message = e.stack;
                this.connection.send(socketMessage);
            }
        });
    }

    /**
     * @param {SocketMessage} socketMessage
     */
    info(socketMessage) {
        const
            client = this.db.client,
            guilds = client.guilds,
            channels = client.channels,
            users = client.users;

        socketMessage.message = {
            shardId: this.db.id,
            channels: channels.cache.size,
            guilds: guilds.cache.size,
            music_players: this.db.carrier.totalPlayers,
            ping: Math.round(client.ws.ping),
            users: users.cache.size
        };

        this.connection.send(socketMessage);
    }

    /**
     * @param {SocketMessage} socketMessage
     */
    verifyGuild(socketMessage) {
        const guildObj = this.db.client.guilds.resolve(socketMessage.request.data.guildId);
        if (!guildObj || !guildObj.available) return;

        socketMessage.message = {
            verified: guildObj.id
        };

        this.connection.send(socketMessage);
    }
}

module.exports = SocketEvents;
