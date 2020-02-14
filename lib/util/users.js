/**
 * User Utilities class
 * @category Util
 */
class UserUtils {
    /**
     * @param {MusicBot} musicBot MusicBot instance
     */
    constructor(musicBot) {
        this.musicBot = musicBot;
    }

    /**
     * @param {String|Number} userId A string or number that identifies a user
     * @param {Number} role_lvl A number that represents what role this user needs to have at least
     * @returns {Boolean} Return true if the user has the mininam required level, false otherwise
     */
    async hasRequiredMinimalRole(userId, role_lvl) {
        const pool = this.musicBot.connPool.promise();

        const [rows, fields] = await pool.query(`SELECT role_id FROM core_users WHERE discord_id = '${userId}' AND role_id <= ${role_lvl} AND not role_id = 0`);

        if (rows.length == 0) {
            return false;
        }

        return true;
    }
}

module.exports = UserUtils;
