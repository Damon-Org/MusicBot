const
    Options = require('./user/options');

class User {
    /**
     * @param {DamonBase} damonBase
     * @param {Discord_User} user
     */
    constructor(damonBase, user) {
        this.db = damonBase;

        this.user = user;
        this.id = user.id;

        this.banned = null;

        this.options = new Options(this);
    }

    async getInternalId() {
        if (!this.internalId) {
            this.internalId = await this.db.userUtils.addUserIfNotExists(this.id);
        }
        return this.internalId;
    }

    async isBanned() {
        if (this.banned == null) {
            this.banned = false;

            const [rows, fields] = await this.db.db.query(`SELECT ban_id FROM core_users WHERE discord_id='${this.id}'`);

            if (rows.length >= 1 && rows[0].ban_id) {
                this.banned = true;
            }
        }

        return this.banned;
    }

    /**
     * @param {external:Number} lvl
     */
    async setPermissionLevel(lvl = 0) {
        if (isNaN(lvl)) return false;

        const internal_id = await this.getInternalId();

        if (lvl < 0) lvl = 0;

        this.db.db.query(`UPDATE core_users SET role_id = ${lvl} WHERE internal_id = ${internal_id}`);

        return true;
    }
}

module.exports = User;
