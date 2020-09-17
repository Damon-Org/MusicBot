import LocalUserStorage from './server/LocalUserStorage.js'
import MusicSystem from './server/music/System.js'
import ServerOptions from './server/ServerOptions.js'

export default class Server {
    tempStorage = new Map();

    constructor(mainClient, guild) {
        this.mainClient = mainClient;

        this.guild = guild;

        this.localUsers = new LocalUserStorage();

        this.options = new ServerOptions(this);

        this.music = new MusicSystem(mainClient, this);
    }

    get id() {
        return this.guild.id;
    }

    get prefix() {
        if (!this._prefix) {
            this._prefix = this.mainClient.getModule('guildSetting').get(this.id, 'prefix');

            if (!this._prefix) this._prefix = this.mainClient.getModule('commandRegistrar').defaultPrefix;
        }

        return this._prefix;
    }

    set prefix(new_value) {
        this.mainClient.getModule('guildSetting').set(this.id, 'prefix', new_value);

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
