'use strict';

const
    token = 'NTY3NzM2ODE5MzA3NzczOTYy.XQP_2w.nIbgKE5z8Lul5fEDXM3_askeMJY',
    ShardManager = require('discord.js').ShardingManager,
    ExternalCommunication = require('./lib/external/communication.js');

const communication = new ExternalCommunication();

const Manager = new ShardManager('main.js', {
    token: token,
    respawn: false
});

Manager.spawn();

Manager.on('launch', shard => {
    console.log(`Shard ${shard.id + 1}/${Manager.totalShards} has started.`);
});
