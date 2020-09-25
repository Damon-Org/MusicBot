import Main from './client/Main.js';
import log from './util/Log.js'

const instance = new Main(process.cwd(), process.env.DISCORD_TOKEN);
instance.start();

process.on('unhandledRejection', (err) => {
    if (!err.ignore) log.error('PROCESS', 'Error Occured:', err.stack);
});

process.on('SIGINT', () => instance.shutdown());
process.on('SIGTERM', () => instance.shutdown());
