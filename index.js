const ShardManager = require('discord.js').ShardingManager;
const token = '***REMOVED***';

const Manager = new ShardManager('main.js', {
    token: token,
    respawn: false
});

Manager.spawn();

Manager.on('launch', shard => {
    console.log(`Shard ${shard.id + 1}/${Manager.totalShards} has started.`);
});
