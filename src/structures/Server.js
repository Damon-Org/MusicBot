import Scope from './Scope.js'
import LocalUserStorage from './server/LocalUserStorage.js'

export default class Server extends Scope {
    constructor(main, guild) {
        super();

        this._m = main;

        this.guild = guild;

        this.localUsers = new LocalUserStorage();

        this.initScope('server');
    }

    get id() {
        return this.guild.id;
    }

    /**
     * @param {string} category
     */
    async getLockedChannelForCategory(category) {
        await this.settings.awaitData();

        return this.settings.data.lockedChannels.find(lockedChannel => lockedChannel.category === category)?.channelId;
    }
}
