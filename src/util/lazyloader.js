const guildSettings = require('../../data/guild_settings.json');

class LazyLoader {
    /**
     * @param {DamonBase} db
     */
    constructor(damonBase) {
        this.db = damonBase;

        this.ready = false;

        this.settings = new Map();

        this.start();
    }

    getOption(option) {
        if (isNaN(option)) {
            throw new Error('Get option expects a numeral instead of a string.');
        }

        return this.db.db.query('SELECT core_guilds.serverId, core_settings.value FROM core_settings INNER JOIN core_guilds ON core_guilds.guild_id=core_settings.guild_id WHERE core_settings.option_id = ?', option);
    }

    get(guild_id, option_name) {
        const settings = this.settings.get(guild_id);
        if (!settings) return undefined;
        return settings[option_name];
    }

    async loadSettings(guildSettings) {
        for (let setting of guildSettings) {
            const [rows, fields] = await this.getOption(setting.id);

            for (let row of rows) {
                this.set(row.serverId, setting.name, row.value);
            }
        }
    }

    set(guild_id, option, value) {
        if (this.settings.has(guild_id)) {
            const settings = this.settings.get(guild_id);
            settings[option] = value;

            this.settings.set(guild_id, settings);

            return;
        }

        const settings = {};
        settings[option] = value;

        this.settings.set(guild_id, settings);
    }

    async start() {
        this.db.log('LAZY', 'INFO', 'LazyLoader has started.');

        await this.loadSettings(guildSettings);

        this.ready = true;

        this.db.log('LAZY', 'INFO', 'LazyLoader done.');
    }
}

module.exports = LazyLoader;
