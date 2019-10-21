'use strict';

const
    token = '***REMOVED***',
    ShardManager = require('discord.js').ShardingManager,
    ExternalCommunication = require('./lib/external/communication.js');

const externalCommunication = new ExternalCommunication();

// Wait for socket server to be ready
externalCommunication.socketServer.on('bind', () => {
    const Manager = new ShardManager('main.js', {
        token: token,
        respawn: false
    });

    Manager.spawn();

    Manager.on('launch', shard => {
        console.log(`Shard ${shard.id + 1}/${Manager.totalShards} has started.`);
    });
});
