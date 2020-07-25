export default class ServerUtils {
    constructor() {

    }

    /**
     * @param {mysql2.connpool} dbPool
     * @param {String|Number} guild_id
     */
    static async addGuild(dbPool, guild_id) {
        const [rows, fields] = await dbPool.query('SELECT guild_id FROM core_guilds WHERE serverId=?', guild_id);

        if (rows.length == 0) {
            await dbPool.query(`INSERT INTO core_guilds (serverId) VALUES (?)`, guild_id);
        }
    }
}
