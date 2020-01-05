'use strict';

const
    fs = require('fs'),
    config = JSON.parse(fs.readFileSync(`${__dirname}/data/config.json`)),
    token = config.development ? config.token.dev : config.token.prod,
    ShardManager = require('discord.js').ShardingManager;

if (config.development) {
    console.log('============== Development Mode Active ==============');
}

const Manager = new ShardManager(`${__dirname}/main.js`, {
    token: token,
    respawn: false,
    shardArgs: [
        token
    ]
});

Manager.spawn();

Manager.on('launch', shard => {
    console.log(`[SHARD_MANAGER] Shard ${shard.id + 1}/${Manager.totalShards} has started.`);
});
