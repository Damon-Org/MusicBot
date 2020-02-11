const
    mysql = require('mysql2'),
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

        this.startIntervals();
    }

    connectToDB() {
        this.connPool = mysql.createPool(this.config.credentials.db);
    }

    connectToLavaLinkServer() {
        this.carrier = new Shoukaku(this.client, this.config.credentials.lavalink, {
            moveOnDisconnect: false,
            resumable: false,
            resumableTimeout: 30,
            reconnectTries: 2,
            restTimeout: 10000
        });

        this.carrier.on('ready', (name) => console.log(`[LAVA/INFO] Node: ${name} is now connected`));
        // Error must be handled
        this.carrier.on('error', (name, error) => console.log(`\x1b[31m[LAVA/ERR]\x1b[0m Node: ${name} emitted an error.`, error));
        // Close emits when a lavalink node disconnects.
        this.carrier.on('close', (name, code, reason) => console.log(`\x1b[33m[LAVA/WARN]\x1b[0m Node: ${name} closed with code ${code}. Reason: ${reason || 'No reason'}`));
        // Disconnected emits when a lavalink node disconnected and will not try to reconnect again.
        this.carrier.on('disconnected', (name, reason) => console.log(`\x1b[33m[LAVA/WARN]\x1b[0m Node: ${name} disconnected. Reason: ${reason || 'No reason'}`));
    }

    /**
     * This method will log any errors happing to an error log file
     * @param {String} message An error message
     */
    error(message) {
        const date = new Date();
        message = `Error occured on ${date}\r\n${message}\r\n`;

        //console.log(message);

        fs.appendFile(`${this.main_dir}/log/${date.getUTCFullYear()}-${date.getUTCMonth()+1}-${date.getUTCDate()}-error.log`, message, (err) => {
            if (err) throw err;
        });
    }

    startIntervals() {
        this.totalServerCount = null;

        const interVal1ID = setInterval(async () => {
            if (this.client.shard.count <= 1) {
                clearInterval(interVal1ID);
            }

            this.totalServerCount = (await this.client.shard.fetchClientValues('guilds.size')).reduce((prev, val) => prev + val, 0);
        }, 60*1e3);
    }
}
