import BaseModule from '../structures/BaseModule.js'
import pkg from 'shoukaku'

import log from '../util/Log.js'

export default class LavaLink extends BaseModule {
    constructor(mainClient) {
        super(mainClient);

        this.register(LavaLink, {
            name: 'lavaLink'
        });
    }

    setup() {
        this.conn = new pkg.Shoukaku(this.mainClient, this.auth.credentials.lavalink, {
            moveOnDisconnect: false,
            resumable: "lavaRetryTheRedemptionArc",
            resumableTimeout: 30,
            reconnectTries: 100,
            restTimeout: 2e4
        });

        this.conn.on('ready', (name) => log.info('LAVALINK', `Node: ${name} is now connected`));
        this.conn.on('error', (name, error) => log.error('LAVALINK', `Node: ${name} emitted an error.\n${error.stack}`));
        this.conn.on('close', (name, code, reason) => log.warn('LAVALINK', `Node: ${name} closed with code ${code}. Reason: ${reason || 'No reason'}`));
        this.conn.on('disconnected', (name, reason) => log.critical('LAVALINK', `Node: ${name} disconnected. Reason: ${reason || 'No reason'}`));
    }
}
