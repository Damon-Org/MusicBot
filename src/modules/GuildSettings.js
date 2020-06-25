import BaseModule from '../structures/BaseModule.js'
import guildSettings from '../../data/guild_settings.js'
import log from '../util/Log.js'

export default class GuildSettings extends BaseModule {
    /**
     * @param {MainClient} mainClient
     */
    constructor(mainClient) {
        super(mainClient);

        this.register(GuildSettings, {
            name: 'guildSetting',
            requires: [
                'db'
            ]
        });

        this._settings = new Map();
    }

    getOption(option) {
        if (isNaN(option)) {
            throw new Error('Get option expects a numeral instead of a string.');
        }

        return this.getModule('db').pool.query('SELECT core_guilds.serverId, core_settings.value FROM core_settings INNER JOIN core_entity_settings ON core_entity_settings.setting_id=core_settings.setting_id INNER JOIN core_guilds ON core_entity_settings.entity_id=core_guilds.guild_id WHERE core_entity_settings.entity_type=1 AND core_settings.option_id=?', option);
    }

    get(guild_id, option_name) {
        const settings = this._settings.get(guild_id);
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
        if (this._settings.has(guild_id)) {
            const settings = this._settings.get(guild_id);
            settings[option] = value;

            this._settings.set(guild_id, settings);

            return;
        }

        const settings = {};
        settings[option] = value;

        this._settings.set(guild_id, settings);
    }

    async setup() {
        log.info('GUILD_SETTINGS', 'LazyLoader has started.');

        await this.loadSettings(guildSettings);

        this.ready = true;

        log.info('GUILD_SETTINGS', 'LazyLoader done.');
    }

}
