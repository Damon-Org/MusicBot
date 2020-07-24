import BaseCommand from './BaseCommand.js'

export default class WebSocketCommand extends BaseCommand {
    constructor(...args) {
        super(...args);
    }

    get connected() {
        return this.ws.connected;
    }

    get ws() {
        return this.getModule('ws');
    }
}
