'use strict';

global.PATH = '/home/node/music';
const
    startTime = new Date(),
    { HandleException } = require('./lib/functions.js'),
    { BotEvents } = require('./lib/botevents.js'),
    //token = '***REMOVED***'; // Dragon
    //token = '***REMOVED***'; // QuiltyPleasure
    //token = '***REMOVED***'; // DragonDev
    //token = '***REMOVED***'; // Team Fortress 2
    token = '***REMOVED***'; // Damon Music
    //token = '***REMOVED***'; // Devon Music

const bot = new BotEvents(startTime);

bot.Login(token);

process
    .on('SIGINT', () => {
        console.log('\nBot shutdown requested logging out...');

        setTimeout(function () {
            bot.Logout();
            console.log('Bot logout done!');
            process.exit();
        }, 500);
    })

    .on('SIGTERM', () => {
        console.log('\nBot shutdown requested through SERVICE');

        setTimeout(function () {
            bot.Logout();
            console.log('Bot logout done!');
            process.exit();
        }, 500);
    })

    .on('uncaughtException', err => {
        HandleException(err);

        setTimeout(function () {
            console.log('Fatal error occured, logging bot out.');
            bot.Logout();
            console.log('Bot logout done!');
            process.exit();
        }, 500);
  });
