import BaseModule from '../structures/BaseModule.js'

export default class EventListener extends BaseModule {
    constructor(mainClient) {
        super(mainClient);

        this.register(EventListener, {
            name: 'eventListener',
            requires: [
                'commandRegistrar'
            ]
        });
    }

    setup() {
        this.mainClient.on('message', (msg) => this.onMsg(msg));
    }

    onMsg(msg) {
        this.getModule('commandRegistrar').checkMessage(msg);
    }
}
