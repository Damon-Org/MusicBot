import BaseModule from '../structures/modules/BaseModule.js'
import Util from '../util/Util.js'

export default class CommonValues extends BaseModule {
    constructor(mainClient) {
        super(mainClient);

        this.register(CommonValues, {
            name: 'commonValues'
        });
    }

    get serverCount() {
        if (!this._serverCount) {
            return 0;
        }
        return this._serverCount;
    }

    setup() {
        this._startUpdateLoop();
    }

    async _getServerCount() {
        if (this.mainClient.shard.count == 1) {
            return this.mainClient.guilds.cache.size;
        }

        try {
            return (await this.mainClient.shard.fetchClientValues('guilds.cache.size')).reduce((prev, val) => prev + val, 0);
        } catch (e) {
            return 0;
        }
    }

    async _startUpdateLoop() {
        this._serverCount = await this._getServerCount();

        await Util.delay(9e4);

        this._startUpdateLoop();
    }
}
