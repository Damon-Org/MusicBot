const
    mysql = require('mysql2');
    fs = require('fs'),
    BotEvents = require('./events.js'),
    CommandRegisterer = require('../commands/command.js'),
    MusicUtil = require('../util/music.js'),
    ServerUtils = require('../util/server.js'),
    UserUtil = require('../util/users.js')

module.exports = class MusicBot extends BotEvents {
    /**
     * @param {string} token A valid token so our Discord.client can login
     */
    constructor(token) {
        super();

        this.bootUp = Date.now();

        this.config = JSON.parse(fs.readFileSync('./data/config.json'));

        this.login(token);

        this.startListeners();

        this.createConnection();

        this.servers = new Map();
        this.musicUtil = new MusicUtil(this);
        this.serverUtils = new ServerUtils(this);
        this.userUtil = new UserUtil(this);

        this.commandRegisterer = new CommandRegisterer(this, './data/commands.json');
    }

    createConnection() {
        this.connPool = mysql.createPool({
            connectionLimit: 100,
            host: 'localhost',
            user: 'phpmyadmin',
            password: 'andreasma2013',
            database: 'damon',
            debug: false
        });

        console.log('Connection succesfull!');
    }
}
