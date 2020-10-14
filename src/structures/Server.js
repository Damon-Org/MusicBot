import LocalUserStorage from './server/LocalUserStorage.js'
import ServerOptions from './server/ServerOptions.js'

export default class Server {
    constructor(main, guild) {
        this._m = main;

        this.guild = guild;

        this.localUsers = new LocalUserStorage();

        this.options = new ServerOptions(main, this);

        this._initServerModules();
    }

    /**
     * Initializes all registered server modules and clones their instances into the server class
     */
    _initServerModules() {
        const modules = this._m.modules.getScope('server');

        for (const [ name, module ] of modules) {
            this[name] = module.clone(this);
        }
    }

    get id() {
        return this.guild.id;
    }

    get prefix() {
        if (!this._prefix) {
            this._prefix = this._m.getModule('guildSetting').get(this.id, 'prefix');

            if (!this._prefix) this._prefix = this._m.getModule('commandRegistrar').defaultPrefix;
        }

        return this._prefix;
    }

    set prefix(new_value) {
        this._m.getModule('guildSetting').set(this.id, 'prefix', new_value);

        this.options.update('guildPrefix', new_value);

        this._prefix = new_value;
    }

    async getLockedChannels() {
        if (!this._lockedChannels) {
            const music = await this.options.get(1);

            this._lockedChannels = {
                music: music
            };
        }

        return this._lockedChannels;
    }
}
