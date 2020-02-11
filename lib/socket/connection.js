const
    EventEmitter = require('events'),
    Net = require('net');

module.exports = class Connection extends EventEmitter {
    constructor(port) {
        super();

        this.port = port;
        this.token = 'yeet';
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
        this.client.on('close', (hadError) => this.emit('close', hadError));
    }

    connectionError(e) {
        if (e.message.includes('connect ECONNREFUSED')) {
            console.log('\x1b[33m[SOCKET/WARN]\x1b[0m Connection refused by socket server, is it running?');

            return;
        }
        console.error(e.stack);
    }

    externalMessage(data) {
        if (!this.ready) {
            const message = data.toString();
            if (message.includes('authentication_required') || message.includes('invalid_auth')) {
                if (this.try == 2) {
                    throw 'Socket Authentication token is not valid!';

                    return;
                }

                this.client.write(`Bearer: ${this.token}`);
                this.try++;

                return;
            }

            if (message.includes('client?')) {
                this.client.write('Client: bot');

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

        this.emit('message', this.client, data);
    }
}
