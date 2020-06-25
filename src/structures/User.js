import UserOptions from './user/UserOptions.js'

export default class User {
    /**
     * @param {MainClient} mainClient
     * @param {User} user
     */
    constructor(mainClient, user) {
        this.mainClient = mainClient;

        this.user = user;

        this.options = new UserOptions(this);
    }

    get id() {
        return this.user.id;
    }

    /**
     * Adds the user to the Database if they haven't been added already
     * @private
     */
    async _addUserIfNotExists() {
        const pool = this.mainClient.getModule('db').pool;
        let
            [rows, fields] = await this.pool.query('SELECT internal_id FROM core_users WHERE discord_id = ?', this.id),
            id;

        if (rows.length == 0) {
            [rows, fields] = await this.pool.query('INSERT INTO core_users (discord_id) VALUES (?)', this.id);

            id = rows.insertId;
        }

        if (!id) id = rows[0].internal_id;

        return id;
    }

    async getInternalId() {
        if (!this._internalId) {
            this._internalId = await this._addUserIfNotExists();
        }
        return this._internalId;
    }

    async isBanned() {
        if (!this._banned) {
            this._banned = false;

            const [rows, fields] = await this.mainClient.getModule('db').pool.query('SELECT ban_id FROM core_users WHERE discord_id=?', this.id);

            if (rows.length >= 1 && rows[0].ban_id) {
                this._banned = true;
            }
        }

        return this._banned;
    }
}
