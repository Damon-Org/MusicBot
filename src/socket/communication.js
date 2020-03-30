const
    Connection = require('./connection'),
    SocketEvents = require('./events');

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
         * @type {SocketEvents}
         */
        this.socketEvents = new SocketEvents(musicBot);

        /**
         * @type {String}
         */
        this.clientType = 'bot';
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
        this.musicBot.log('SOCKET', 'WARN', 'Lost connection to socket server, reattempting connection after timeout.')

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
        this.connection.destroy();
    }

    connected() {
        this.musicBot.log('SOCKET', 'INFO', 'Successfully connected!');

        this.socketEvents.eventListener = this.connection;

        this.tries = 0;
    }

    reconnect() {
        this.lastTry = Date.now();

        /**
         * @type {Connection}
         * @readonly
         */
        this.connection = new Connection(this.clientType, this.port, this.musicBot.auth.credentials.socket);

        this.tries++;

        if (this.tries == 100) {
            this.musicBot.log('SOCKET', 'CRITICAL', `Socket connection still not responding after ${this.tries} tries.`);

            return;
        }

        this.events();
    }

    events() {
        this.connection.once('bind', () => this.connected());

        this.connection.on('message', (socket, message) => this.handleCommand(socket, message));

        this.connection.once('close', () => this.attemptReconnect());
    }
}

module.exports = SocketCommunication;
