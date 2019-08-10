const Server = require('../server.js');

module.exports = class ServerUtils {
    /**
     * @param {MusicBot} musicBot MusicBot instance
     */
    constructor(musicBot) {
        this.musicBot = musicBot;
    }

    /**
     * @param {string|number} serverId A string or number that identifies a guild
     */
    async addGuildIfNotExists(guild) {
        const
            serverId = guild.id,
            pool = this.musicBot.connPool.promise();

        const [rows, fields] = await pool.query(`SELECT guild_id FROM core_guilds WHERE serverId='${serverId}'`);

        if (rows.length == 0) {
            await pool.query(`INSERT INTO core_guilds (serverId, guild_name) VALUES (?, ?)`, [serverId, guild.name]);
        }

        return true;
    }

    /**
     * @param {string|number} serverId A string or number that identifies a guild
     */
    getClassInstance(serverId) {
        let serverMap = this.musicBot.servers;

        if (serverMap.has(serverId)) {
            return serverMap.get(serverId);
        }

        const instance = new Server();
        this.musicBot.servers.set(serverId, instance);

        return instance;
    }

    /**
     * @param {string|number} serverId A string or number that identifies a guild
     * @param {string} option The internal name in the DB of the option to update
     * @param {string|number} value The new value of the option
     */
    async updateGuildOption(serverId, option, value) {
        const pool = this.musicBot.connPool.promise();

        const [rows, fields] = await pool.query(
            `SELECT setting_id FROM core_settings INNER JOIN core_guilds ON core_settings.guild_id=core_guilds.guild_id
            WHERE core_settings.option_id = (SELECT option_id FROM core_options WHERE internal_name='${option}')
            AND core_guilds.serverId = '${serverId}'`
        );

        if (rows.length == 0) {
            await pool.query(
                `INSERT INTO core_settings (guild_id, option_id, value) VALUES ((SELECT guild_id FROM core_guilds WHERE serverId='${serverId}'), (SELECT option_id FROM core_options WHERE internal_name='${option}'), '${value}')`
            );

            return true;
        }

        await pool.query(`UPDATE core_settings SET value='${value}' WHERE setting_id = ${rows[0].setting_id}`);
        return true;
    }
}
