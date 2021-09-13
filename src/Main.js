import auth from '@/data/auth.js'
import config from '@/data/config.js'
import Log from './util/Log.js'
import { ShardingManager } from 'discord.js'

export default class Main extends ShardingManager {
    constructor() {
        super('./src/Client.js', {
            token: config.development ? auth.token.dev : auth.token.prod,
            respawn: !config.development,
            execArgv: [
                '--experimental-loader=./util/loader.js'
            ]
        });

        this.on('shardCreate', this.shardCreated.bind(this));
    }

    /**
     * @returns {Log}
     */
    get log() {
        return Log;
    }

    exit() {
        for (const shard of this.shards.values())
            if (shard.ready)
                shard.kill();

        process.exit();
    }

    async start() {
        this.spawn();
    }

    shardCreated(shard) {
        this.log.info('SHARD_MANAGER', `Shard ${shard.id + 1}/${this.totalShards} has started.`);
    }
}