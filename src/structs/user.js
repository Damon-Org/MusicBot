class User {
    /**
     * @param {DamonFramework} damonFramework
     * @param {Discord_User} user
     */
    constructor(damonFramework, user) {
        this.df = damonFramework;

        this.user = user;
        this.id = user.id;

        this.banned = null;
    }

    /**
     * @param {external:String|external:Number} issuer The admin that bans the person
     * @param {external:String} reason
     */
    async ban(issuer, reason) {
        if (reason && reason.length > 256) {
            return [false, 'Reason too long, keep it under 256 characters.'];
        }

        const
            internal_id = await this.df.userUtils.addUserIfNotExists(this.id),
            [rows, field] = await this.df.db.query(`SELECT ban_id FROM core_users WHERE internal_id = ${internal_id}`);

        if (rows[0].ban_id) {
            return [false, 'This user is already banned.'];
        }

        const
            [result, fields] = await this.df.db.query(`INSERT INTO core_bans (internal_id, banned_by, reason) VALUES (?, (SELECT internal_id FROM core_users WHERE discord_id = ?), ?)`, [internal_id, issuer, reason]),
            ban_id = result.insertId;

        await this.df.db.query(`UPDATE core_users SET ban_id = ? WHERE internal_id = ?`, [ban_id, internal_id]);

        return [true, ban_id, internal_id];
    }

    async isBanned() {
        if (this.banned == null) {
            this.banned = false;

            const [rows, fields] = await this.df.db.query(`SELECT ban_id FROM core_users WHERE discord_id='${this.id}'`);

            if (rows[0].ban_id) {
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

        const internal_id = await this.df.userUtils.addUserIfNotExists(this.id);

        if (lvl < 0) lvl = 0;

        this.df.db.query(`UPDATE core_users SET role_id = ${lvl} WHERE internal_id = ${internal_id}`);

        return true;
    }
}

module.exports = User;
