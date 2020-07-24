import UserOptions from './user/UserOptions.js'
import Util from '../util/Util.js'

export default class User {
    /**
     * @param {MainClient} mainClient
     * @param {User} user
     */
    constructor(mainClient, user) {
        this.mainClient = mainClient;

        this.user = user;

        this.options = new UserOptions(this);
        this.storage = new Map();
    }

    get id() {
        return this.user.id;
    }

    get banned() {
        return this.storage.get('banned');
    }

    /**
     * @param {boolean} toggle
     */
    set banned(toggle) {
        this.storage.set('banned', toggle);
    }

    get permissionLevel() {
        return this.storage.get('permissionLevel');
    }

    /**
     * @param {number} level
     */
    set permissionLevel(level) {
        this.storage.set('permissionLevel', level);
    }

    /**
     * Adds the user to the Database if they haven't been added already
     * @private
     */
    async _addUserIfNotExists() {
        const pool = this.mainClient.getModule('db').pool;
        let
            [rows, fields] = await pool.query('SELECT internal_id FROM core_users WHERE discord_id = ?', this.id),
            id;

        if (rows.length == 0) {
            [rows, fields] = await pool.query('INSERT INTO core_users (discord_id) VALUES (?)', this.id);

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

    /**
     * @param {number} level
     * @param {string} condition
     */
    async hasPermission(level, condition) {
        if (!['<', '<=', '==', '>', '>='].includes(condition)) {
            throw new Error('Invalid condition was passed!');

            return false;
        }

        if (!this.permissionLevel) {
            const [rows, fields] = await this.mainClient.getModule('db').pool.query(`SELECT role_id FROM core_users WHERE discord_id=? AND not role_id = 0`, this.id);
            if (rows.length >= 1)
                this.permissionLevel = rows[0].role_id;
            else
                this.permissionLevel = 0;
        }
        // eval("5 <= 4") == false
        // eval("5 <= 6") == true
        return eval(this.permissionLevel + condition + level);
    }

    async isBanned() {
        if (!this.banned) {
            const [rows, fields] = await this.mainClient.getModule('db').pool.query('SELECT ban_id FROM core_users WHERE discord_id=?', this.id);

            if (rows.length >= 1 && rows[0].ban_id)
                this.banned = true;
            else
                this.banned = false;
        }

        return this.banned;
    }

    toJSON() {
        return Util.flatten(this, {
            user: false,

            banned: true,
            permissionLevel: true
        });
    }
}
