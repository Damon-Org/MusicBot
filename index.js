'use strict';

const
    //token = 'NTQ0NTIyMDU0OTMwNzkyNDQ5.XdExdA.-j0hmybYVhANIqhK6GPIY0BVXn4', // Damon Music
    token = '***REMOVED***', // Devon Music
    ShardManager = require('discord.js').ShardingManager;

const Manager = new ShardManager(`${__dirname}/main.js`, {
    token: token,
    respawn: false
});

Manager.spawn();

Manager.on('launch', shard => {
    console.log(`[SHARD_MANAGER] Shard ${shard.id + 1}/${Manager.totalShards} has started.`);
});
