'use strict';

const
    auth = require(`${__dirname}/data/auth.json`),
    config = require(`${__dirname}/data/config.json`),
    token = config.development ? auth.token.dev : auth.token.prod,
    ShardManager = require('discord.js').ShardingManager;

if (config.development) {
    console.log('============== Development Mode Active ==============');
}

const Manager = new ShardManager(`${__dirname}/main.js`, {
    token: token,
    respawn: !config.development,
    shardArgs: [
        token
    ]
});

Manager.spawn();

Manager.on('shardCreate', shard => {
    console.log(`[SHARD_MANAGER] Shard ${shard.id + 1}/${Manager.totalShards} is starting...`);
});
