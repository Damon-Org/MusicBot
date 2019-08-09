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
}
