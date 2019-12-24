const
    mysql = require('mysql2');
    fs = require('fs'),
    BotEvents = require('./events.js'),
    CommandRegisterer = require('../commands/command.js'),

    opus = require('node-opus'),

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

        this.createConnection();

        this.servers = new Map();

        this.embedUtils = new EmbedUtils();
        this.musicUtils = new MusicUtils(this);
        this.serverUtils = new ServerUtils(this);
        this.userUtils = new UserUtils(this);

        this.commandRegisterer = new CommandRegisterer(this, `${main_dir}/data/commands.json`);
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
