const
    fs = require('fs'),
    mysql = require('mysql'),
    { API } = require('./api'),
    { MusicSystem } = require('./music');

module.exports = class MusicBot {
    constructor() {
        this.Discord = require('discord.js');

        this.client = new this.Discord.Client();

        this.Setup(bool => {
            bool ? console.log('Bot setup done!') : process.exit();
        });
    }

    Setup(funCallback) {
        if (!fs.existsSync(global.PATH +'/data/config.json')) {
            console.log('Config File is missing, shutting down!');
            return funCallback(false);
        }

        this.config = JSON.parse(fs.readFileSync(global.PATH +'/data/config.json'));

        global.MusSys = new MusicSystem(this.config, this.client);
        if (global.MusSys == undefined) {
            console.log('Music System failed to start');
            return funCallback(false);
        }

        global.api = new API();
        this.api = global.api;

        this.conn = mysql.createConnection({
            host: '127.0.0.1',
            user: 'phpmyadmin',
            password: 'andreasma2013',
            database: 'damon'
        });

        this.conn.connect(err => {
            if (err) {
                console.error('Error connecting to MySQL DB: ' + err.stack);
                return funCallback(false);
            }

            global.conn = this.conn;
            return funCallback(true);
        });

        //return funCallback(true);
    }

    Login(token) {
        this.client.login(token);
    }

    Logout() {
        this.client.destroy();
    }
}
