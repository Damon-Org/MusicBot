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

/**
 * This is the main entry point of Damon Music
 * @category Bot
 * @extends BotEvents
 */
class MusicBot extends BotEvents {
    /**
     * @param {external:String} token A valid token so our Discord.client can login
     * @param {external:String} main_dir To make sure everything is imported not from working directory that the process is running from but from the main project directory
     */
    constructor(token, main_dir) {
        super();
        /**
         * This property holds the root directory the bot has been launched from
         * @type {external:String}
         * @readonly
         */
        this.main_dir = main_dir;

        /**
         * The moment this instance has been created (number of milliseconds since EPOCH)
         * @type {external:Number}
         * @readonly
         */
        this.bootUp = Date.now();

        /**
         * This object holds the authentication data for the DB, Lavalink server, bot tokens,...
         * @type {external:Object}
         * @readonly
         */
        this.auth = JSON.parse(fs.readFileSync(`${main_dir}/data/auth.json`));
        /**
         * This object holds the config data as development mode is enabled or not, which default prefix to use,...
         * @type {external:Object}
         * @readonly
         */
        this.config = JSON.parse(fs.readFileSync(`${main_dir}/data/config.json`));

        /**
         * @type {SocketCommunication}
         * @readonly
         */
        this.socketCommunication = new SocketCommunication(this);

        this.login(token);

        this.startListeners();

        this.connectToDB();

        this.connectToLavaLinkServer();

        /**
         * This map holds all the guilds that have used at least once the bot since bootUp
         * @type {external:Map}
         */
        this.servers = new Map();


        /**
         * @type {EmbedUtils}
         * @readonly
         */
        this.embedUtils = new EmbedUtils();
        /**
         * @type {MusicUtils}
         * @readonly
         */
        this.musicUtils = new MusicUtils(this);
        /**
         * @type {ServerUtils}
         * @readonly
         */
        this.serverUtils = new ServerUtils(this);
        /**
         * @type {UserUtils}
         * @readonly
         */
        this.userUtils = new UserUtils(this);

        /**
         * @type {CommandRegisterer}
         * @readonly
         */
        this.commandRegisterer = new CommandRegisterer(this, `${main_dir}/data/commands.json`);
    }

    /**
     * Establishes the DB connection
     */
    connectToDB() {
        /**
         * @type {mysql2.promiseConnectionPool}
         */
        this.connPool = mysql.createPool(this.config.development ? this.auth.credentials.db.dev : this.auth.credentials.db.prod);
    }

    /**
     * Establishes the connection to all the Lavalink nodes
     */
    connectToLavaLinkServer() {
        /**
         * @type {external:Shoukaku}
         * @readonly
         */
        this.carrier = new Shoukaku(this.client, this.auth.credentials.lavalink, {
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
     * @param {external:String} message An error message
     */
    error(message) {
        const date = new Date();
        message = `Error occured on ${date}\r\n${message}\r\n`;

        fs.appendFile(`${this.main_dir}/log/${date.getUTCFullYear()}-${date.getUTCMonth()+1}-${date.getUTCDate()}-error.log`, message, (err) => {
            if (err) throw err;
        });
    }

    startIntervals() {
        const presences = [
            {
                activity: {
                    type: 'LISTENING',
                    name: 'd!help'
                }
            },
            {
                activity: {
                    type: 'WATCHING',
                    name: 'us on https://music.damon.sh'
                }
            },
            {
                activity: {
                    type: 'WATCHING',
                    name: `version ${global.version}`
                }
            }
        ];

        /**
         * @type {external:Number}
         * @readonly
         */
        this.totalServerCount = null;

        const totalServerCount = async () => {
            this.totalServerCount = (await this.client.shard.fetchClientValues('guilds.size')).reduce((prev, val) => prev + val, 0);
        }

        const interValID_1 = setInterval(() => {
            if (this.client.shard.count <= 1) {
                clearInterval(interValID_1);

                return;
            }

            totalServerCount();
        }, 60*1e3);

        const presenceLoop = () => {
            for (let i = 0; i < presences.length; i++) {
                setTimeout(() => {
                    this.client.user.setPresence(presences[i]);
                }, 25*1e3*i);
                [i]
            }
        }
        presenceLoop();

        const interValID_2 = setInterval(() => {
            presenceLoop();
        }, 25*1e3*presences.length);
    }
}

module.exports = MusicBot;
