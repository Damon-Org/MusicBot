const
    EventEmitter = require('events'),
    Net = require('net');

module.exports = class SocketServer extends EventEmitter {
    /**
     * @constructor
     */
    constructor() {
        super();

        this.clients = new Map();
    }

    /**
     * @param {String} clientId A string identifier for socket clients
     * @param {Error} error
     */
    clientError(clientId, error) {
        const socket = this.getClientSocket(clientId);

        console.log('Socket encountered error:\n' + error.stack);

        //this.emit('error', socket, error);
    }

    /**
     * @param {String} clientId A string identifier for socket clients
     * @param {Buffer} buffer A binary buffer containing the message
     */
    clientMessage(clientId, buffer) {
        const socket = this.getClientSocket(clientId);

        this.emit('message', socket, buffer);
    }

    /**
     * @param {String} clientId A string identifier for socket clients
     */
    clientReady(clientId) {
        const socket = this.getClientSocket(clientId);

        this.emit('ready', socket);
    }

    /**
     * @param {Boolean} hadError If the socket was closed because of an error
     * @param {Net.Socket} socket The socket of the client that closed
     */
    clientSocketClosed(clientId, hadError) {
        const socket = this.getClientSocket(clientId);

        this.emit('disconnect', socket);

        this.clients.delete(clientId);
    }

    createServer() {
        this.server = Net.createServer((socket) => {
            const clientId = socket.remoteAddress + ':' + socket.remotePort;

            this.clients.set(clientId, socket);

            this.emit('connect', socket);

            socket.on('ready', () => this.clientReady(clientId));

            socket.on('data', (buffer) => this.clientMessage(clientId, buffer));

            socket.on('error', (error) => this.clientError(clientId, error));

            socket.on('close', (hadError) => this.clientSocketClosed(clientId, hadError));
        });

        this.server.listen(this.port, '0.0.0.0', () => {
            this.emit('bind', this.port);
        });
    }

    async getPort() {
        let port = 5432;

        while (await this.isPortInUse(port)) {
            port++;
        }

        return port;
    }

    getClientSocket(clientId) {
        return this.clients.get(clientId);
    }

    isPortInUse(port) {
        return new Promise((resolve, reject) => {
            const server = new Net.Server();

            server.listen(port, 'localhost');

            server.on('error', () => {
                resolve(true);
            });

            server.on('listening', () => {
                server.close();
            });

            server.on('close', () => {
                resolve(false);
            });
        });
    }

    async setup() {
        this.port = await this.getPort();

        process.env.EXT_SOCKET_PORT = this.port;

        this.createServer();
    }
}
