const
    MusicBot = require('./lib/bot/main.js'),
    //token = 'NTQ0NTIyMDU0OTMwNzkyNDQ5.XdExdA.-j0hmybYVhANIqhK6GPIY0BVXn4'; // Damon Music
    token = 'NTY3NzM2ODE5MzA3NzczOTYy.XQP_2w.nIbgKE5z8Lul5fEDXM3_askeMJY'; // Devon Music

const instance = new MusicBot(token, __dirname);

process
    .on('SIGINT', () => {
        console.log('\nBot shutdown requested logging out...');

        setTimeout(async () => {
            await instance.socketCommunication.close();

            process.exit();
        }, 500);
    })

    .on('SIGTERM', async () => {
        console.log('\nBot shutdown requested through SERVICE');

        await instance.socketCommunication.close();

        process.exit();
    })

    .on('unhandledPromiseRejectionWarning', (err) => {
        if (err) {
            instance.error(err.stack);
        }
    })

    .on('uncaughtException', err => {
        console.log(err.stack);

        setTimeout(async () => {
            console.log('Fatal error occured.');
            await instance.socketCommunication.close();

            process.exit();
        }, 500);
  });
