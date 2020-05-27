const
    mysql = require('mysql2'),
    fs = require('fs'),
    { Shoukaku } = require('shoukaku'),

    BotEvents = require('./events'),
    CommandRegisterer = require('../commands/command'),

    SocketCommunication = require('../socket/communication'),

    // Utils
    EmbedUtils = require('../util/embed'),
    MainUtils = require('../util/main'),
    MusicUtils = require('../util/music'),
    ServerUtils = require('../util/server'),
    SocketUtils = require('../util/socket'),
    UserUtils = require('../util/user'),

    APICollections = require('../music/api/collections'),
    LazyLoader = require('../util/lazyloader');

/**
 * This is the main entry point of Damon Music
 * @category Bot
 * @extends BotEvents
 */
class DamonBase extends BotEvents {
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
         * This is a 6 character long identifier based on the bootUp time of the shard
         * @type {external:String}
         * @readonly
         */
        this.id = this.bootUp.toString(16).substr(-6);

        /**
         * This object holds the authentication data for the DB, Lavalink server, bot tokens,...
         * @type {external:Object}
         * @readonly
         */
        this.auth = require(`${main_dir}/data/auth.json`);
        /**
         * This object holds the config data as development mode is enabled or not, which default prefix to use,...
         * @type {external:Object}
         * @readonly
         */
        this.config = require(`${main_dir}/data/config.json`);

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
         * This map holds all the users that have used at least once the bot since bootUp
         * @type {external:Map}
         */
        this.users = new Map();

        /**
         * @type {EmbedUtils}
         * @readonly
         */
        this.embedUtils = new EmbedUtils();
        /**
         * @type {MainUtils}
         * @readonly
         */
        this.mainUtils = new MainUtils(this);
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
         * @type {SocketUtils}
         * @readonly
         */
        this.socketUtils = new SocketUtils();
        /**
         * @type {UserUtils}
         * @readonly
         */
        this.userUtils = new UserUtils(this);

        /**
         * @type {LazyLoader}
         */
        this.lazyLoader = new LazyLoader(this);

        /**
         * @type {APICollections}
         */
        this.api = new APICollections(this);

        const commandAccessable = [
            {
                db: this
            }
        ];
        /**
         * @type {CommandRegisterer}
         * @readonly
         */
        this.commandRegisterer = new CommandRegisterer(this, ...commandAccessable);
    }

    /**
     * Establishes the DB connection
     */
    connectToDB() {
        /**
         * @type {mysql2.promiseConnectionPool}
         */
        this.db = mysql.createPool(this.config.development ? this.auth.credentials.db.dev : this.auth.credentials.db.prod).promise();
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
            resumable: "lavaRetryTheRedemptionArc",
            resumableTimeout: 30,
            reconnectTries: 100,
            restTimeout: 2e4
        });

        this.carrier.on('ready', (name) => this.log('LAVA', 'INFO', `Node: ${name} is now connected`));
        // Error must be handled
        this.carrier.on('error', (name, error) => this.log('LAVA', 'ERROR', `Node: ${name} emitted an error.\n${error}`));
        // Close emits when a lavalink node disconnects.
        this.carrier.on('close', (name, code, reason) => this.log('LAVA', 'WARN', `Node: ${name} closed with code ${code}. Reason: ${reason || 'No reason'}`));
        // Disconnected emits when a lavalink node disconnected and will not try to reconnect again.
        this.carrier.on('disconnected', (name, reason) => this.log('LAVA', 'WARN', `Node: ${name} disconnected. Reason: ${reason || 'No reason'}`));
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

    activeSongCount() {
        let count = 0;

        for (let server of this.servers.values()) {
            if (server.musicSystem.active) {
                count += server.musicSystem.queue.count();
            }
        }

        return count;
    }

    async getServerCount()
    {
        if (this.client.shard.count == 1) {
            return this.client.guilds.cache.size;
        }
        return (await this.client.shard.fetchClientValues('guilds.cache.size')).reduce((prev, val) => prev + val, 0);
    }

    startIntervals() {
        // Setup Presence Values
        this.presence_values = {
            version: global.version,
            serverCount: 1
        };

        this.startPresenceLoop();
    }

    async startPresenceLoop()
    {
        this.presence_values.serverCount = await this.getServerCount();

        for (let i = 0; i < this.config.presence_settings.presences.length; i++) {
            const presence = this.config.presence_settings.presences[i];

            this.client.user.setPresence({
                activity: {
                    type: presence.activity.type,
                    name: this.mainUtils.presenceStringEval(presence.activity.name)
                }
            });

            await this.mainUtils.awaitTimeout(this.config.presence_settings.switch_interval);
        }

        this.startPresenceLoop();
    }
}

module.exports = DamonBase;
