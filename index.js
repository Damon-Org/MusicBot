'use strict';

const
    fs = require('fs'),
    auth = JSON.parse(fs.readFileSync(`${main_dir}/data/auth.json`)),
    config = JSON.parse(fs.readFileSync(`${__dirname}/data/config.json`)),
    token = config.development ? auth.token.dev : auth.token.prod,
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
