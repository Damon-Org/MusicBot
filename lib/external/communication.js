const
    ExternalConnection = require('./connection.js'),
    SocketServer = require('./socketserver.js');

module.exports = class ExternalCommunication {
    /**
     * @constructor
     */
    constructor() {
        this.socketServer = new SocketServer();
        this.socketServer.setup();

        // Server events
        this.socketServer.on('bind', (port) => this.serverReady(port));

        // Connected socket events
        this.socketServer.on('connect', (socket) => this.clientConnect(socket));
        this.socketServer.on('message', (socket, message) => this.clientMessage(socket, message));
        this.socketServer.on('disconnect', (socket) => this.clientDisconnected(socket));

        this.internalClients = [];
        this.externalClients = new Map();
    }

    /**
     * @param {String} clientId
     * @param {Net.Socket} socket
     * @param {JSONObject} message
     */
    broadcastInternal(clientId, socket, message) {
        let json = null;

        try {
            json = JSON.parse(message.toString().replace('\r\n', ''));
            json.requester = clientId;
        } catch (e) {
            socket.write('invalid format\r\n');
            return;
        }

        console.log(json);

        for (let i = 0; i < this.internalClients.length; i++) {
            const
                clientId = this.internalClients[i],
                socket = this.socketServer.getClientSocket(clientId);

            socket.write(JSON.stringify(json));
        }
    }


    /**
     * @param {Net.Socket} socket
     */
    clientConnect(socket) {
        const
            remoteAddress = socket.remoteAddress,
            clientId = remoteAddress + ':' + socket.remotePort;

        if (remoteAddress == '127.0.0.1' || remoteAddress == 'localhost') {
            this.internalClients.push(clientId);

            return;
        }

        this.externalClients.set(clientId, new ExternalConnection(clientId, socket));

        socket.write('authentication required\r\n');
    }

    /**
     * @param {Net.Socket} socket
     */
    clientDisconnected(socket) {
        const
            remoteAddress = socket.remoteAddress,
            clientId = remoteAddress + ':' + socket.remotePort;

        if (remoteAddress == '127.0.0.1' || remoteAddress == 'localhost') {
            const index = this.internalClients.indexOf(clientId);

            if (index != -1) {
                this.internalClients.splice(index, 1);
            }

            return;
        }

        this.externalClients.delete(clientId);
    }

    /**
     * @param {Net.Socket} socket
     * @param {Buffer} message A message from the socket server
     */
    clientMessage(socket, message) {
        const
            clientId = socket.remoteAddress + ':' + socket.remotePort,
            externalConn = this.externalClients.get(clientId);

        if (externalConn && !externalConn.authenticated) {
            const msgString = message.toString();

            if (msgString.includes('Bearer: ')) {
                const token = msgString.split(' ')[1].replace('\r\n', '');

                if (token == 'yeet') {
                    externalConn.authorize();

                    socket.write('authenticated\r\n');

                    return;
                }
            }

            socket.write('invalid auth\r\n');

            return;
        }

        if (externalConn) {
            this.broadcastInternal(clientId, socket, message);

            return;
        }

        this.sendDM(message);
    }

    /**
     * Makes sure the socket server is properly closed down
     */
    async close() {
        // await this.socketServer.kill();

        return true;
    }

    sendDM(message) {
        message = JSON.parse(message.toString())

        const
            clientId = message.data.clientId,
            externalConn = this.externalClients.get(clientId);

        externalConn.socket.write(JSON.stringify(message));
    }

    serverReady(port) {
        console.log(`Socket server is ready and listening on port ${port}`);
    }
}
