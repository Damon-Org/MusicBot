class SocketEvents {
    /**
     * @param {MusicBot} musicBot
     */
    constructor(musicBot) {
        /**
         * @type {MusicBot}
         */
        this.musicBot = musicBot;
    }

    /**
     * @param {Connection} new_value
     */
    set eventListener(new_value) {
        this.connection = new_value;

        this.connection.on('info', (socketMessage) => this.getShardInfo(socketMessage));
    }

    /**
     * @param {SocketMessage} socketMessage
     */
    getShardInfo(socketMessage) {
        const
            client = this.musicBot.client,
            guilds = client.guilds,
            channels = client.channels,
            users = client.users;

        socketMessage.message = {
            channels: channels.size,
            guilds: guilds.size,
            ping: Math.round(client.ws.ping),
            users: users.size,
            voiceConnections: this.musicBot.carrier.totalPlayers
        };

        this.connection.send(socketMessage);
    }
}

module.exports = SocketEvents;
