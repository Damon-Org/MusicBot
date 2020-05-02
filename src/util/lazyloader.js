class LazyLoader {
    /**
     * @param {DamonBase} db
     */
    constructor(damonBase) {
        this.db = damonBase;

        this.ready = false;

        this.prefixes = new Map();

        this.start();
    }

    async loadPrefixes() {
        const [rows, fields] = await this.db.db.query('SELECT core_guilds.serverId, core_settings.value FROM core_settings INNER JOIN core_guilds ON core_guilds.guild_id=core_settings.guild_id WHERE core_settings.option_id = 2');

        rows.forEach((row) => {
            this.prefixes.set(row.serverId, row.value);
        });
    }

    async start() {
        this.db.log('LAZY', 'INFO', 'LazyLoader has started.');

        await this.loadPrefixes();

        this.ready = true;

        this.db.log('LAZY', 'INFO', 'LazyLoader done.');
    }
}

module.exports = LazyLoader;
