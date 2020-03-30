const Server = require('../structs/server.js');

/**
 * This class contains basic "server" utilities (by server we imply a "discord guild")
 * @category Util
 */
class ServerUtils {
    /**
     * @constructs
     * @param {DamonFramework} damonFramework MusicBot instance
     */
    constructor(damonFramework) {
        /**
         * @type {DamonFramework}
         */
        this.df = damonFramework;
    }

    /**
     * Adds a guild to the database if it does not exists yet
     * @param {external:Discord_Guild} guild Discord.js Guild Class instance
     */
    async addGuildIfNotExists(guild) {
        const serverId = guild.id;

        const [rows, fields] = await this.df.db.query(`SELECT guild_id FROM core_guilds WHERE serverId='${serverId}'`);

        if (rows.length == 0) {
            await pool.query(`INSERT INTO core_guilds (serverId) VALUES (?)`, [serverId]);
        }
    }

    /**
     * This member returns a Server instance if one exists or creates a new one if it doesn't exist yet
     * @param {external:String} serverId A string or number that identifies a guild
     * @returns {Server} Returns a server instance
     */
    getClassInstance(serverId) {
        const serverMap = this.df.servers;

        if (serverMap.has(serverId)) {
            return serverMap.get(serverId);
        }

        const instance = new Server(this.df, this.df.client.guilds.resolve(serverId));
        this.df.servers.set(serverId, instance);

        return instance;
    }

    /**
     * Deletes a guild option from the database
     * @param {external:String} serverId A string or number that identifies a guild
     * @param {external:String|Number} option The internal_name of the option or a valid option number for faster lookup times
     */
    async deleteGuildOption(serverId, option) {
        if (isNaN(option)) {
            await this.df.db.query(`DELETE FROM core_settings WHERE guild_id=(SELECT guild_id FROM core_guilds WHERE serverId='${serverId}') AND option_id=(SELECT option_id FROM core_options WHERE internal_name='${option}')`);
        }
        else {
            await this.df.db.query(`DELETE FROM core_settings WHERE guild_id=(SELECT guild_id FROM core_guilds WHERE serverId='${serverId}') AND option_id=${option}`);
        }
    }

    /**
     * This member retrieves the value of a guild option
     * @param {external:String} serverId A string or number that identifies a guild
     * @param {external:String|Number} option The internal_name of the option or a valid option number for faster lookup times
     * @returns {*} Returns null if no option is found otherwise the value is supplied
     */
    async getGuildOption(serverId, option) {
        if (isNaN(option)) {
            var [rows, fields] = await this.df.db.query(
                `SELECT value FROM core_settings INNER JOIN core_guilds ON core_settings.guild_id=core_guilds.guild_id
                WHERE core_settings.option_id = (SELECT option_id FROM core_options WHERE internal_name='${option}') AND guilds.serverId = '${serverId}'`
            );
        }
        else {
            var [rows, fields] = await this.df.db.query(
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
     * @param {external:String} serverId A string or number that identifies a guild
     * @param {external:String} option The internal name in the DB of the option to update
     * @param {*} value The new value of the option
     */
    async updateGuildOption(serverId, option, value) {
        const pool = this.df.db.promise();

        const [rows, fields] = await this.df.db.query(
            `SELECT setting_id FROM core_settings INNER JOIN core_guilds ON core_settings.guild_id=core_guilds.guild_id
            WHERE core_settings.option_id = (SELECT option_id FROM core_options WHERE internal_name='${option}')
            AND core_guilds.serverId = '${serverId}'`
        );

        if (rows.length == 0) {
            await this.df.db.query(
                `INSERT INTO core_settings (guild_id, option_id, value) VALUES ((SELECT guild_id FROM core_guilds WHERE serverId='${serverId}'), (SELECT option_id FROM core_options WHERE internal_name='${option}'), '${value}')`
            );

            return;
        }

        await this.df.db.query(`UPDATE core_settings SET value='${value}' WHERE setting_id = ${rows[0].setting_id}`);
    }
}

module.exports = ServerUtils;
