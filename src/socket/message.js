/**
 * This is a helper class for making
 */
class SocketMessage {
    /**
     * @param {Buffer} data
     */
    constructor(data) {
        if (Buffer.isBuffer(data)) {
            const message = JSON.parse(data.toString());

            Object.assign(this, message);
        }
        else if (data instanceof Object) {
            Object.assign(this, data);
        }
        else {
            throw new Error('First argument is not of type Buffer or Object');
        }
    }

    toString() {
        return JSON.stringify({
            "identifier": this.identifier,
            "client_id": this.client_id,
            "client": this.client,
            "target": this.target,
            "metrics": this.metrics,
            "request": this.request,
            "rejected": this.rejected,
            "target_count": this.target_count,
            "timeout": this.timeout,
            "type": this.type,
            "message": this.message
        });
    }

    /**
     * @param {String} identifier
     * @returns {Number} Timestamp
     */
    getTimestamp(identifier) {
        if (!this.metrics) {
            return null;
        }

        return this.metrics[identifier];
    }

    /**
     * @param {String} identifier
     */
    setTimestamp(identifier) {
        this.metrics[identifier] = Date.now();
    }
}

module.exports = SocketMessage;
