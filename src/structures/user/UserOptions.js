export default class UserOptions {
    /**
     * @param {Main} main
     * @param {User} user
     */
    constructor(main, user) {
        this._m = main;
        this.user = user;
    }

    /**
     * @param {string} issuer The admin that bans the person
     * @param {string} reason
     */
    async ban(issuer, reason) {
        if (reason && reason.length > 256) {
            return [false, 'Reason too long, keep it under 256 characters.'];
        }

        const
            pool = this._m.modules.db.pool,
            internalId = await this.user.getInternalId(),
            [rows, field] = await pool.query(`SELECT ban_id FROM core_users WHERE internal_id = ${internalId}`);

        if (rows[0].ban_id) {
            return [false, 'This user is already banned.'];
        }

        const
            [result, fields] = await pool.query(`INSERT INTO core_bans (internal_id, banned_by, reason) VALUES (?, (SELECT internal_id FROM core_users WHERE discord_id = ?), ?)`, [internalId, issuer, reason]),
            ban_id = result.insertId;

        await pool.query(`UPDATE core_users SET ban_id = ? WHERE internal_id = ?`, [ban_id, internalId]);

        return [true, ban_id, internalId];
    }

    async unban() {
        const
            internalId = await this.user.getInternalId(),
            pool = this._m.modules.db.pool;

        await pool.query(`UPDATE core_users SET ban_id = NULL WHERE internal_id = ?`, [internalId]);

        return true;
    }

    /**
     * @param {number} level
     */
    async setPermissionLevel(level = 0) {
        const
            internalId = await this.user.getInternalId(),
            pool = this._m.modules.db.pool;

        await pool.query('UPDATE core_users SET role_id=? WHERE internal_id=?', [level, internalId]);

        return true;
    }
}
