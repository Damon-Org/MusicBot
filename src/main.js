import MainClient from './client/Main.js';
import log from './util/Log.js'

const instance = new MainClient(process.cwd() + '/..', process.env.DISCORD_TOKEN);

process.on('unhandledRejection', (err) => {
    if (!err.ignore) log.error('PROCESS', 'Error Occured:', err.stack);
});

process.on('SIGINT', () => instance.destroy());
process.on('SIGTERM', () => instance.destroy());
