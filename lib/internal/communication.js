const Connection = require('./connection.js');

module.exports = class InternalCommunication {
    constructor(musicBot) {
        this.musicBot = musicBot;

        this.port = 5432;
        this.tries = 0;

        this.lastTry = Date.now();

        this.reconnect();
    }

    attemptReconnect() {
        const time = Date.now() - 6e5 * 5;

        // If 5 minutes have passed since lastTry then we instantly try to reconnect
        if (time >= this.lastTry) {
            this.reconnect();

            return;
        }

        setTimeout(() => {
            this.reconnect();
        }, (this.lastTry - time));
        // Otherwise we wait the remainder of the 5 minutes
    }

    close() {
        return true;
    }

    reconnect() {
        this.connection = new Connection(this.port);

        this.tries++;

        if (this.tries == 100) {
            console.log('MAIN PROCESS socket connection not responding');

            return;
        }

        this.events();
    }

    events() {
        this.connection.on('message', (socket, message) => this.handleCommand(socket, message));

        this.connection.on('close', () => this.attemptReconnect());
    }

    /**
     * @param {Net.Socket} socket
     * @param {Object} message
     */
    getShardInfo(socket, message) {
        const
            client = this.musicBot.client,
            shardId = client.shard.id,
            guilds = client.guilds,
            channels = client.channels,
            users = client.users,
            voiceConnections = client.voiceConnections;

        const object = {
            status: 200,
            name: 'info',
            data: {
                channels: channels.size,
                clientId: message.requester,
                guilds: guilds.size,
                ping: Math.round(client.ping),
                shardId: shardId,
                users: users.size,
                voiceConnections: voiceConnections.size
            }
        };

        socket.write(JSON.stringify(object));
    }

    /**
     * @param {Net.Socket} socket
     * @param {Object} message
     */
    handleCommand(socket, message) {
        try {
            message = JSON.parse(message.toString().replace('\r\n', ''));
        } catch (e) {
            socket.write('message_invalid_type');

            return;
        }

        if (!message.command || !message.requester || !message.guild) {
            socket.write('object_missing_argument');

            return;
        }

        if (!this.musicBot.client.guilds.get(message.guild) && message.command != 'info') {
            console.log('shard does not have guild, ignoring');

            return;
        }

        switch (message.command) {
            case 'info': {
                this.getShardInfo(socket, message);

                break;
            }
            default: {
                socket.write('unknown_command');
            }
        }
    }
}
