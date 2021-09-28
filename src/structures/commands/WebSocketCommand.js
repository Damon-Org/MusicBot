import Modules from '@/src/Modules.js'

export default class WebSocketCommand extends Modules.commandRegistrar.BaseCommand {
    constructor(...args) {
        super(...args);
    }

    get connected() {
        return this.ws.connected;
    }

    get ws() {
        return this.modules.ws;
    }
}
