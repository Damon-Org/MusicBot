import BaseModule from '../structures/BaseModule.js'
import Util from '../util/Util.js'

export default class Presence extends BaseModule {
    /**
     * @param {MainClient} mainClient
     */
    constructor(mainClient) {
        super(mainClient);

        this.register(Presence, {
            name: 'presence',

            events: [
                {
                    name: 'ready',
                    call: 'startInterval'
                }
            ]
        });
    }

    /**
     * This method evaluates a config presence string to something with dynamic values
     * @private
     * @param {String} string String to be evaluated
     */
    _presenceStringEval(string) {
        let outputStr = '';
        const split_str = string.split('${');

        for (let i = 0; i < split_str.length; i++) {
            if (split_str[i].includes('}')) {
                const temp_split = split_str[i].split('}');

                outputStr += this.presenceValues[temp_split[0]];
                outputStr += temp_split[1];

                continue;
            }
            outputStr += split_str[i];
        }

        return outputStr;
    }

    _updatePresenceValues() {
        this.presenceValues.serverCount = this.getModule('commonValues').serverCount;
    }

    setup() {
        Object.assign(this, this.config.presence_settings);

        this.presenceValues = {
            version: this.mainClient.version,
            serverCount: 1
        };
    }

    async startInterval() {
        await this._updatePresenceValues();

        for (const presence of this.presences) {
            this.mainClient.user.setPresence({
                activity: {
                    type: presence.activity.type,
                    name: this._presenceStringEval(presence.activity.name)
                }
            });

            await Util.delay(this.switch_interval);
        }

        this.startInterval();
    }
}
