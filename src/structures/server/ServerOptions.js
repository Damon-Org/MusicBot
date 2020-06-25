export default class ServerOptions {
    /**
     * @param {Server} server
     */
    constructor(server) {
        this.mainClient = server.mainClient;

        this.server = server;
    }

    /**
     * @param {String|Number} option
     */
    async delete(option) {
        const pool = this.mainClient.getModule('db').pool;

        if (isNaN(option)) {
            await pool.query('DELETE S FROM core_settings S INNER JOIN core_entity_settings ON core_entity_settings.setting_id=S.setting_id INNER JOIN core_guilds ON core_guilds.guild_id=core_entity_settings.entity_id INNER JOIN core_options ON S.option_id=core_options.option_id WHERE core_guilds.serverId=? AND core_options.internal_name=?', [this.server.id, option]);
        }
        else {
            await pool.query('DELETE S FROM core_settings S INNER JOIN core_entity_settings ON core_entity_settings.setting_id=S.setting_id INNER JOIN core_guilds ON core_guilds.guild_id=core_entity_settings.entity_id WHERE core_guilds.serverId=? AND S.option_id=?', [this.server.id, option]);
        }
    }

    /**
     * @param {String|Number} option Can be an option_id or the internal name of this option
     */
    async get(option) {
        const pool = this.mainClient.getModule('db').pool;
        let rows, fields;

        if (isNaN(option)) {
            [rows, fields] = await pool.query('SELECT value FROM core_settings INNER JOIN core_entity_settings ON core_entity_settings.setting_id=core_settings.setting_id INNER JOIN core_guilds ON core_guilds.guild_id=core_entity_settings.entity_id INNER JOIN core_options ON core_settings.option_id=core_options.option_id WHERE core_guilds.serverId=? AND core_options.internal_name=?', [this.server.id, option]);
        }
        else {
            [rows, fields] = await pool.query('SELECT value FROM core_settings INNER JOIN core_entity_settings ON core_entity_settings.setting_id=core_settings.setting_id INNER JOIN core_guilds ON core_guilds.guild_id=core_entity_settings.entity_id WHERE core_guilds.serverId=? AND core_settings.option_id=?', [this.server.id, option]);
        }

        if (rows.length == 0) {
            return null;
        }

        return rows[0].value;
    }

    /**
     * This member will insert a new guild option if does not exists yet or update if it already exists
     * @param {String|Number} option The internal name in the DB of the option to update
     * @param {*} value The new value of the option
     */
    async update(option, value) {
        const pool = this.mainClient.getModule('db').pool;
        let rows, fields;

        if (isNaN(option)) {
            [rows, fields] = await pool.query('SELECT S.setting_id FROM core_settings S INNER JOIN core_entity_settings ON core_entity_settings.setting_id=S.setting_id INNER JOIN core_guilds ON core_guilds.guild_id=core_entity_settings.entity_id INNER JOIN core_options ON S.option_id=core_options.option_id WHERE core_guilds.serverId=? AND core_options.internal_name=?', [this.server.id, option]);
        }
        else {
            [rows, fields] = await pool.query('SELECT S.setting_id FROM core_settings INNER JOIN core_entity_settings ON core_entity_settings.setting_id=S.setting_id INNER JOIN core_guilds ON core_guilds.guild_id=core_entity_settings.entity_id WHERE core_guilds.serverId=? AND S.option_id=?', [this.server.id, option]);
        }

        if (rows.length == 0) {
            let result, field;

            if (isNaN(option))
                [result, field] = await pool.query('INSERT INTO core_settings (option_id, value) SELECT option_id, ? FROM core_options WHERE internal_name=?', [value, option]);
            else
                [result, field] = await pool.query('INSERT INTO core_settings (option_id, value) VALUES option_id, ?', [value, option]);

            await pool.query('INSERT INTO core_entity_settings (entity_id, entity_type, setting_id) SELECT guild_id, 1, ? FROM core_guilds WHERE serverId=?', [result.insertId, this.server.id]);

            return;
        }

        await pool.query('UPDATE core_settings SET value=? WHERE setting_id=?', [value, rows[0].setting_id]);
    }
}
