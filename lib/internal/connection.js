const
    EventEmitter = require('events'),
    Net = require('net');

module.exports = class InternalConnection extends EventEmitter {
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
            this.client.on('data', (data) => this.externalMessage(data));
            this.client.on('close', (hadError) => this.emit('close', hadError));
        });
    }

    externalMessage(data) {
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

        this.emit('message', this.client, data);
    }
}
