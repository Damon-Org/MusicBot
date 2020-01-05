const MusicBot = require('./lib/bot/main.js');

const instance = new MusicBot(process.argv[2], __dirname);

process
    .on('SIGINT', () => {
        console.log('\nBot shutdown requested logging out...');

        setTimeout(async () => {
            await instance.socketCommunication.close();
            instance.logout();

            process.exit();
        }, 500);
    })

    .on('SIGTERM', async () => {
        console.log('\nBot shutdown requested through SERVICE');

        await instance.socketCommunication.close();
        instance.logout();

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
            instance.logout();

            process.exit();
        }, 500);
  });
