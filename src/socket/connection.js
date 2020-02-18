const
    EventEmitter = require('events'),
    Net = require('net'),

    SocketMessage = require('./message.js');

/**
 * This class handles the socket connection
 * It handles client authentication and client type handshake
 * @category Socket
 * @extends EventEmitter
 */
class Connection extends EventEmitter {
    /**
     * @param {external:String} clientType
     * @param {external:Number} port
     * @param {external:String} token Socket Authentication token
     */
    constructor(clientType, port, token) {
        super();

        /**
         * @type {String}
         */
        this.clientType = clientType;
        /**
         * @type {external:Number}
         */
        this.port = port;
        /**
         * @type {external:String}
         */
        this.token = token;
        /**
         * @type {external:Number}
         */
        this.try = 0;

        this.connect();
    }

    connect() {
        this.client = Net.createConnection({
            port: this.port,
            host: 'socket.music.damon.sh'
        }, () => {
            this.emit('bind');
            this.client.on('data', (data) => this.externalMessage(data));
        });

        this.client.on('error', (error) => this.connectionError(error));
        this.client.once('close', (hadError) => this.emit('close', hadError));
    }

    connectionError(e) {
        if (e.message.includes('connect ECONNREFUSED')) {
            console.log('\x1b[33m[SOCKET/WARN]\x1b[0m Connection refused by socket server, is it running?');

            return;
        }
        console.error(e.stack);
    }

    destroy() {
        this.client.write(JSON.stringify({
            client: this.clientType,
            request: 'disconnect'
        }));

        if (!this.client.destroyed) {
            this.client.destroy();
        }
    }

    /**
     * This method will handle authentication with the socket server if we haven't authenticated yet
     * if authenticated we just forward the message
     * @param {Buffer} data
     */
    externalMessage(data) {
        if (!this.ready) {
            const message = data.toString();
            if (message.includes('authentication_required') || message.includes('invalid_auth')) {
                if (this.try == 2) {
                    throw new Error('Socket Authentication token is not valid!');

                    return;
                }

                this.client.write(`Bearer: ${this.token}`);
                this.try++;

                return;
            }

            if (message.includes('client?')) {
                this.client.write(`Client: ${this.clientType}`);

                return;
            }

            if (message.includes('server_closing')) {
                console.log('Received server close message');

                return;
            }

            if (message.includes('ready')) {
                this.ready = true;

                return;
            }
        }

        try {
            const socketMessage = new SocketMessage(data);
            socketMessage.setTimestamp('target_received');

            this.emit(socketMessage.request, socketMessage);
        } catch (e) {
            if (e.message.includes('Unexpected token') && e.message.includes('in JSON at position')) {
                const message = data.toString();

                if (message.includes('server_closing')) {
                    console.log('\x1b[33m[SOCKET/WARN]\x1b[0m Received server close message!');

                    return;
                }

                console.log(message);
            }
        }
    }

    /**
     * @param {SocketMessage} socketMessage
     */
    send(socketMessage) {
        socketMessage.setTimestamp('target_sent');

        this.client.write(socketMessage.toString());
    }
}

module.exports = Connection;
