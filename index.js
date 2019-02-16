global.PATH = '/home/node/projects/music';
const
    startTime = new Date(),
    { BotEvents } = require('./lib/botevents.js'),
    //token = '***REMOVED***'; // Dragon
    //token = '***REMOVED***'; // QuiltyPleasure
    //token = '***REMOVED***'; // DragonDev
    //token = '***REMOVED***'; // Team Fortress 2
    token = '***REMOVED***'; // Damon Music

// Faster socket connection
const bufferutil = require('bufferutil');
// Faster socket (de)serialisation
const erlpack = require('erlpack');
// Faster voice packet (d)ecryption
const sodium = require('sodium');

bot = new BotEvents(startTime);

bot.Login(token);

process.on('SIGINT', () => {
    console.log('\nBot shutdown requested logging out...');

    setTimeout(function () {
        bot.Logout();
        console.log('Bot logout done!');
        process.exit();
    }, 500);
});
