import EventModule from '../structures/modules/EventModule.js'
import log from '../util/Log.js'

import WSUtil from './ws/Util.js'
import WSClient from './ws/Client.js'

export default class WSCommunicator extends EventModule {
    /**
     * @param {MainClient} mainClient
     */
    constructor(mainClient) {
        super(mainClient);

        this.register(WSCommunicator, {
            name: 'ws'
        });

        this.util = new WSUtil(this);
    }

    /**
     * @returns {boolean}
     */
    get connected() {
        return this.client.connected;
    }

    setup() {
        this.client = new WSClient(this);
    }
}
