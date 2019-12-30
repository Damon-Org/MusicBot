const
    mysql = require('mysql2');
    fs = require('fs'),
    BotEvents = require('./events.js'),
    CommandRegisterer = require('../commands/command.js'),

    { Shoukaku } = require('shoukaku'),

    SocketCommunication = require('../socket/communication.js'),

    // Utils
    EmbedUtils = require('../util/embed.js'),
    MusicUtils = require('../util/music.js'),
    ServerUtils = require('../util/server.js'),
    UserUtils = require('../util/users.js');

module.exports = class MusicBot extends BotEvents {
    /**
     * @param {String} token A valid token so our Discord.client can login
     * @param {String} main_dir To make sure everything is imported not from working directory that the process is running from but from the main project directory
     */
    constructor(token, main_dir) {
        super();
        this.main_dir = main_dir;

        this.bootUp = Date.now();

        this.config = JSON.parse(fs.readFileSync(`${main_dir}/data/config.json`));

        this.socketCommunication = new SocketCommunication(this);

        this.login(token);

        this.startListeners();

        this.connectToDB();

        this.connectToLavaLinkServer();

        this.servers = new Map();

        this.embedUtils = new EmbedUtils();
        this.musicUtils = new MusicUtils(this);
        this.serverUtils = new ServerUtils(this);
        this.userUtils = new UserUtils(this);

        this.commandRegisterer = new CommandRegisterer(this, `${main_dir}/data/commands.json`);
    }

    connectToDB() {
        this.connPool = mysql.createPool({
            connectionLimit: 100,
            host: '10.0.0.8',
            user: 'db_admin',
            password: 's7E1$EA41%$vu6',
            database: 'damon',
            debug: false
        });
    }

    connectToLavaLinkServer() {
        const lavaLinkServers = [{
            name: 'Damon LavaLink #1',
            host: 'lavalink.damon.sh',
            port: 6978,
            auth: '3s^l82aZ2i8p^1X%'
        }];

        this.carrier = new Shoukaku(this.client, lavaLinkServers, {
            moveOnDisconnect: false,
            resumable: false,
            resumableTimeout: 30,
            reconnectTries: 2,
            restTimeout: 10000
        });

        this.carrier.on('ready', (name) => console.log(`[LAVA] Node: ${name} is now connected`));
        // Error must be handled
        this.carrier.on('error', (name, error) => console.log(`[LAVA] Node: ${name} emitted an error.`, error));
        // Close emits when a lavalink node disconnects.
        this.carrier.on('close', (name, code, reason) => console.log(`[LAVA] Node: ${name} closed with code ${code}. Reason: ${reason || 'No reason'}`));
        // Disconnected emits when a lavalink node disconnected and will not try to reconnect again.
        this.carrier.on('disconnected', (name, reason) => console.log(`[LAVA] Node: ${name} disconnected. Reason: ${reason || 'No reason'}`));
    }

    /**
     * This method will log any errors happing to an error log file
     * @param {String} message An error message
     */
    error(message) {
        const date = new Date();
        message = `Error occured on ${date}\r\n${message}\r\n`;

        //console.log(message);

        fs.appendFile(`./log/${date.getUTCFullYear()}-${date.getUTCMonth()+1}-${date.getUTCDate()}-error.log`, message, (err) => {
            if (err) throw err;
        });
    }
}
