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
            port: this.port
        }, () => {
            this.client.on('data', (data) => this.externalMessage(data));
        });
    }

    externalMessage(data) {
        this.emit('message', this.client, data);
    }
}
