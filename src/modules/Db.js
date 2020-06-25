import BaseModule from '../structures/BaseModule.js'

import mysql from 'mysql2/promise.js'

export default class DB extends BaseModule {
    /**
     * @param {MainClient} mainClient
     */
    constructor(mainClient) {
        super(mainClient);

        this.register(DB, {
            name: 'db'
        });
    }

    setup() {
        this.pool = mysql.createPool(this.config.development ? this.auth.credentials.db.dev : this.auth.credentials.db.prod);
    }
}
