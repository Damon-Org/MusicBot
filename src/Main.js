import Main from './client/Main.js';
import log from './util/Log.js'

const instance = new Main(process.env.DISCORD_TOKEN);
instance.start();

process.on('unhandledRejection', (err) => {
    if (!err.ignore) log.error('PROCESS', 'Error Occured:', err);
});

process.on('SIGINT', () => instance.shutdown('SIGINT'));
process.on('SIGTERM', () => instance.shutdown('SIGTERM'));
