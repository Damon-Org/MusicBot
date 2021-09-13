import { Client as DiscordClient, Intents } from 'discord.js'
import { resolve } from 'path'
import auth from '@/data/auth.js'
import config from '@/data/config.js'
import EmbedUtils from './util/Embed.js'
import Log from './util/Log.js'
import Modules from './Modules.js'
import ServerManager from './managers/ServerManager.js'
import Util from './util/Util.js'

class Client extends DiscordClient {
    _gs = new Map();
    _serverManager = new ServerManager(this);

    constructor() {
        super({
            disableMentions: 'everyone',

            retryLimit: 1,
            restRequestTimeout: 3e4,

            intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_VOICE_STATES ]
        });

        this.bootUp = Date.now();

        Object.assign(this, {
            auth,
            config,
            embedUtils: EmbedUtils,
            util: Util
        });

        this._version = this.util.loadJson('/package.json').version;
    }

    get globalStorage() {
        return this._gs;
    }

    get log() {
        return Log;
    }

    get modules() {
        return Modules;
    }

    get servers() {
        return this._serverManager;
    }

    get version() {
        return this._version;
    }

    async exit(signal = 'INTERNAL') {
        this.destroy();

        this.log.info('CLIENT', `Received ${signal} signal, shutting down...`);

        await Modules.cleanup();

        process.exit(0);
    }

    async start() {
        this.log.info('CLIENT', 'Loading modules...');

        await Modules.load(this, resolve('./src/modules'));

        this.log.info('CLIENT', 'Finished loading modules.');

        await this.login();
    }
}

const client = new Client();
client.start();

['beforeExit', 'SIGUSR1', 'SIGUSR2', 'SIGINT', 'SIGTERM'].map(_ => process.once(_, client.exit.bind(client)));
process.on('unhandledRejection', (err) => {
    if (!err.ignore)
        Log.error('SHARD', 'Unhandled error:', err);
});