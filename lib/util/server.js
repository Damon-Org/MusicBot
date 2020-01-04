const Server = require('../server.js');

/**
 * This class contains basic "server" utilities (by server we emply a "discord guild")
 */
module.exports = class ServerUtils {
    /**
     * @constructs
     * @param {MusicBot} musicBot MusicBot instance
     */
    constructor(musicBot) {
        this.musicBot = musicBot;
    }

    /**
     * Adds a guild to the database if it does not exists yet
     * @param {Discord.Guild} guild Discord.js Guild Class instance
     */
    async addGuildIfNotExists(guild) {
        const
            serverId = guild.id,
            pool = this.musicBot.connPool.promise();

        const [rows, fields] = await pool.query(`SELECT guild_id FROM core_guilds WHERE serverId='${serverId}'`);

        if (rows.length == 0) {
            await pool.query(`INSERT INTO core_guilds (serverId) VALUES (?)`, [serverId]);
        }

        return true;
    }

    /**
     * This member returns a Server instance if one exists and creates a new one if none exists yet
     * @param {string|number} serverId A string or number that identifies a guild
     */
    getClassInstance(serverId) {
        const serverMap = this.musicBot.servers;

        if (serverMap.has(serverId)) {
            return serverMap.get(serverId);
        }

        const instance = new Server(this.musicBot, serverId);
        this.musicBot.servers.set(serverId, instance);

        return instance;
    }

    /**
     * This member retrieves the value of a guild option
     * @param {string|number} serverId A string or number that identifies a guild
     * @param {string|number} option The internal_name of the option or a valid option number for faster lookup times
     */
    async getGuildOption(serverId, option) {
        const pool = this.musicBot.connPool.promise();

        if (isNaN(option)) {
            var [rows, fields] = await pool.query(
                `SELECT value FROM core_settings INNER JOIN core_guilds ON core_settings.guild_id=core_guilds.guild_id
                WHERE core_settings.option_id = (SELECT option_id FROM core_options WHERE internal_name='${option}') AND guilds.serverId = '${serverId}'`
            );
        }
        else {
            var [rows, fields] = await pool.query(
                `SELECT value FROM core_settings WHERE guild_id = (SELECT guild_id FROM core_guilds WHERE serverId = '${serverId}') AND option_id = ${option}`
            );
        }

        if (rows.length == 0) {
            return null;
        }

        return rows[0].value;
    }

    /**
     * This member will insert a new guild option if does not exists yet or update if it already exists
     * @param {String|Number} serverId A string or number that identifies a guild
     * @param {String} option The internal name in the DB of the option to update
     * @param {String|Number} value The new value of the option
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

            return;
        }

        await pool.query(`UPDATE core_settings SET value='${value}' WHERE setting_id = ${rows[0].setting_id}`);
    }
}
