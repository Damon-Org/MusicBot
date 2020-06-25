import { ShardingManager } from 'discord.js'
import auth from './data/auth.js'
import config from './data/config.js'

const shardManager = new ShardingManager(`${process.cwd()}/src/main.js`, {
    token: config.development ? auth.token.dev : auth.token.prod,
    respawn: !config.development,
    shardArgs: [
        process.env.npm_package_version
    ]
});

shardManager.spawn();

shardManager.on('shardCreate', shard => console.log(`[SHARD_MANAGER] Shard ${shard.id + 1}/${shardManager.totalShards} is starting...`));
