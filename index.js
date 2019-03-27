global.PATH = '/home/node/music';
const
    startTime = new Date(),
    { BotEvents } = require('./lib/botevents.js'),
    //token = 'NDAyMjQ2NTA5MzEzMzkyNjQw.DT2PIA.W9WqU027YvKV3kLLQbjRaiUdid8'; // Dragon
    //token = 'NDAzNjQ4OTMwNTE4NDAxMDI1.DrWsuA.OcUcXuC8IgCwvsXovl0zJgj4tcw'; // QuiltyPleasure
    //token = 'NDQzNzgwMTA1OTk1ODEyODY0.DmCY6w.UEF0d9sdHyH8_vm7vsGomf65uWs'; // DragonDev
    //token = 'NDQ1OTgzNzc1NjQyNDg0NzM3.DrjurA.oOA-W3ASbD_wuyaIuxb8OsUBRtA'; // Team Fortress 2
    token = 'NTQ0NTIyMDU0OTMwNzkyNDQ5.D0MVXQ._FtN9i_PoXPjJLRSH5ftatFg3mA'; // Damon Music

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
