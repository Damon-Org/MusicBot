const
    fs = require('fs'),
    mongoClient = require('mongodb').MongoClient,
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

        mongoClient.connect(
            'mongodb://damon:znUjnw89CviM0d6Zg83V4Fr6fZkkgg4N0BAM7zHfXsLNontiAQ8ZmbGy9JlsiBhD@127.0.0.1/damon-music', 
            { 
                useNewUrlParser: true 
            }, 
        (err, db) => {
            if (err) throw err;
            global.conn = db.db('damon-music');
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
