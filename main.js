const
    MusicBot = require('./lib/bot/main.js'),
    token = 'NTY3NzM2ODE5MzA3NzczOTYy.XQP_2w.nIbgKE5z8Lul5fEDXM3_askeMJY';

const instance = new MusicBot(token);

process
    .on('SIGINT', () => {
        console.log('\nBot shutdown requested logging out...');

        setTimeout(function () {
            instance.logout();
            console.log('Bot logout done!');
            process.exit();
        }, 500);
    })

    .on('SIGTERM', () => {
        console.log('\nBot shutdown requested through SERVICE');

        setTimeout(function () {
            instance.logout();
            console.log('Bot logout done!');
            process.exit();
        }, 500);
    })

    .on('uncaughtException', err => {
        console.log(err.stack);

        setTimeout(function () {
            console.log('Fatal error occured, logging bot out.');
            instance.logout();
            console.log('Bot logout done!');
            process.exit();
        }, 500);
  });
