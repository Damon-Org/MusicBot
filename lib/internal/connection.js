const
    EventEmitter = require('events'),
    Net = require('net');

module.exports = class InternalConnection extends EventEmitter {
    constructor(port) {
        super();

        this.port = port;

        this.connect();
    }

    connect() {
        this.client = Net.createConnection({
            port: this.port,
            host: '127.0.0.1'
        }, () => {
            this.client.on('data', (data) => this.externalMessage(data));
            this.client.on('close', (hadError) => this.emit('close', hadError));
        });
    }

    externalMessage(data) {
        this.emit('message', this.client, data);
    }
}
