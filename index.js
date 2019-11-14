'use strict';

const
    token = '***REMOVED***',
    ShardManager = require('discord.js').ShardingManager;

const Manager = new ShardManager('main.js', {
    token: token,
    respawn: false
});

Manager.spawn();

Manager.on('launch', shard => {
    console.log(`[SHARD_MANAGER] Shard ${shard.id + 1}/${Manager.totalShards} has started.`);
});
