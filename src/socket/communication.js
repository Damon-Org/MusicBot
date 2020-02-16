const Connection = require('./connection.js');

/**
 * Socket Communication
 * @category Socket
 */
class SocketCommunication {
    /**
     * @param {MusicBot} musicBot
     */
    constructor(musicBot) {
        /**
         * @type {MusicBot}
         */
        this.musicBot = musicBot;

        /**
         * @type {external:Number}
         */
        this.port = 5432;
        /**
         * The amount of reconnect tries that have occured
         * @type {external:Number}
         */
        this.tries = 0;

        /**
         * Time when we last tried to reconned
         * @type {external:Number}
         */
        this.lastTry = Date.now();

        this.reconnect();
    }

    attemptReconnect() {
        console.log('\x1b[33m[SOCKET/WARN]\x1b[0m Lost connection to socket server.');
        console.log('\x1b[33m[SOCKET/WARN]\x1b[0m Reattempting connect after timer runs out.');

        const time = Date.now() - 6e3 * 5;

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

    connected() {
        console.log('[SOCKET/INFO] Successfully connected!');

        this.tries = 0;
    }

    reconnect() {
        this.lastTry = Date.now();

        /**
         * @type {SocketCommunication}
         * @readonly
         */
        this.connection = new Connection(this.port, this.musicBot.auth.credentials.socket);

        this.tries++;

        if (this.tries == 100) {
            console.log(`\x1b[31m[SOCKET/CRITICAL]\x1b[0m Socket connection still not responding after ${this.tries} tries.`);

            return;
        }

        this.events();
    }

    events() {
        this.connection.on('bind', () => this.connected());

        this.connection.on('message', (socket, message) => this.handleCommand(socket, message));

        this.connection.on('close', () => this.attemptReconnect());
    }

    /**
     * @param {Net.Socket} socket
     * @param {external:Object} message
     * @param {external:Object} metrics
     */
    getShardInfo(socket, message, metrics) {
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
            },
            metrics: metrics
        };

        socket.write(JSON.stringify(object));
    }

    /**
     * @param {Net.Socket} socket
     * @param {external:Object} message
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

        const metrics = message.metrics;
        metrics.handled = Date.now();

        switch (message.command) {
            case 'info': {
                this.getShardInfo(socket, message, metrics);

                break;
            }
            default: {
                socket.write('unknown_command');
            }
        }
    }
}

module.exports = SocketCommunication;
