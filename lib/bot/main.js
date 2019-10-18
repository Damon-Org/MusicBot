const
    mysql = require('mysql2');
    fs = require('fs'),
    BotEvents = require('./events.js'),
    CommandRegisterer = require('../commands/command.js'),

    opus = require('node-opus'),

    InternalCommunication = require('../internal/communication.js'),

    // Utils
    EmbedUtils = require('../util/embed.js'),
    MusicUtils = require('../util/music.js'),
    ServerUtils = require('../util/server.js'),
    UserUtils = require('../util/users.js');

module.exports = class MusicBot extends BotEvents {
    /**
     * @param {string} token A valid token so our Discord.client can login
     */
    constructor(token) {
        super();

        this.bootUp = Date.now();

        this.config = JSON.parse(fs.readFileSync('./data/config.json'));

        this.internalCommunication = new InternalCommunication(this);

        this.login(token);

        this.startListeners();

        this.createConnection();

        this.servers = new Map();

        this.embedUtils = new EmbedUtils();
        this.musicUtils = new MusicUtils(this);
        this.serverUtils = new ServerUtils(this);
        this.userUtils = new UserUtils(this);

        this.commandRegisterer = new CommandRegisterer(this, './data/commands.json');
    }

    createConnection() {
        this.connPool = mysql.createPool({
            connectionLimit: 100,
            host: '10.0.0.8',
            user: 'db_admin',
            password: 's7E1$EA41%$vu6',
            database: 'damon',
            debug: false
        });
    }
}
