const Connection = require('./connection.js');

module.exports = class InternalCommunication {
    constructor(musicBot) {
        this.musicBot = musicBot;

        this.tries = 0;

        this.reconnect();
    }

    reconnect() {
        this.connection = new Connection(process.env.EXT_SOCKET_PORT);

        this.tries++;

        if (this.tries == 5) {
            console.log('MAIN PROCESS socket connection not responding');

            return;
        }

        this.events();
    }

    events() {
        this.connection.on('message', (socket, message) => this.handleCommand(socket, message));

        this.connection.on('close', () => this.reconnect());
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
            sendTo: message.requester,
            status: 200,
            name: 'info',
            data: {
                guilds: guilds.size,
                channels: channels.size,
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
            console.log('message non valid');

            return;
        }

        if (!message.command || !message.requester || !message.guild) {
            console.log('object missing argument');

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
                console.log('unknown command');
            }
        }
    }
}
