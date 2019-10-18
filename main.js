const
    MusicBot = require('./lib/bot/main.js'),
    token = 'NTY3NzM2ODE5MzA3NzczOTYy.XQP_2w.nIbgKE5z8Lul5fEDXM3_askeMJY';

const instance = new MusicBot(token);

process
    .on('SIGINT', () => {
        console.log('\nBot shutdown requested logging out...');

        setTimeout(async () => {
            await instance.communication.close();

            process.exit();
        }, 500);
    })

    .on('SIGTERM', async () => {
        console.log('\nBot shutdown requested through SERVICE');

        await instance.communication.close();

        process.exit();
    })

    .on('uncaughtException', err => {
        console.log(err.stack);

        setTimeout(async () => {
            console.log('Fatal error occured.');
            await instance.communication.close();

            process.exit();
        }, 500);
  });
