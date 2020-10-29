import LocalUserStorage from './server/LocalUserStorage.js'

export default class Server {
    constructor(main, guild) {
        this._m = main;

        this.guild = guild;

        this.localUsers = new LocalUserStorage();

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

    /**
     * @param {string} category
     */
    async getLockedChannelForCategory(category) {
        await this.setting.awaitData();

        return this.setting.data.lockedChannels.find(lockedChannel => lockedChannel.category === category)?.channelId;
    }
}
