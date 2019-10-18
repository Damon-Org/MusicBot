module.exports = class ExternalConnection {
    /**
     * @param {String} clientId
     * @param {Net.Socket} socket
     */
    constructor(clientId, socket) {
        this.clientId = clientId;
        this.socket = socket;

        this.authenticated = false;
    }

    authorize() {
        this.authenticated = true;
    }
}
