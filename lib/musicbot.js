const
    mysql = require('mysql'),
    fs = require('fs'),
    { API } = require('./api'),
    { MusicSystem } = require('./music');

module.exports = class MusicBot {
    constructor() {
        this.Discord = require('discord.js');

        this.client = new this.Discord.Client();

        this.Setup(bool => {
            if (bool == true)
                console.log('Bot setup done!');
            else
                process.exit();
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

        global.conn = mysql.createConnection({
            host: '127.0.0.1',
            user: 'phpmyadmin',
            password: 'andreasma2013',
            database: 'damon-music'
        });

        global.conn.connect(err => {
            if (err) {
                console.log("Database Connect " + err);
                return funCallback(false);
            }
            console.log("Connected to Database");
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
