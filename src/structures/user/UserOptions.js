export default class UserOptions {
    /**
     * @param {User} user
     */
    constructor(user) {
        this.mainClient = user.mainClient;

        this.user = user;
    }

    /**
     * @param {String} issuer The admin that bans the person
     * @param {String} reason
     */
    async ban(issuer, reason) {
        if (reason && reason.length > 256) {
            return [false, 'Reason too long, keep it under 256 characters.'];
        }

        const
            pool = this.mainClient.getModule('db').pool,
            internalId = await this.user.getInternalId(),
            [rows, field] = await pool.query(`SELECT ban_id FROM core_users WHERE internal_id = ${internalId}`);

        if (rows[0].ban_id) {
            return [false, 'This user is already banned.'];
        }

        const
            [result, fields] = await pool.query(`INSERT INTO core_bans (internal_id, banned_by, reason) VALUES (?, (SELECT internal_id FROM core_users WHERE discord_id = ?), ?)`, [internalId, issuer, reason]),
            ban_id = result.insertId;

        await pool.query(`UPDATE core_users SET ban_id = ? WHERE internal_id = ?`, [ban_id, internalId]);

        this.user.banned = true;

        return [true, ban_id, internalId];
    }

    async unban() {
        const
            internalId = await this.user.getInternalId(),
            pool = this.mainClient.getModule('db').pool;

        await pool.query(`UPDATE core_users SET ban_id = NULL WHERE internal_id = ?`, [internalId]);

        this.user.banned = false;

        return true;
    }

}
