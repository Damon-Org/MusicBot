const
    Choice = require('./music/choice.js'),
    MusicSystem = require('./music/system.js');

module.exports = class Server {
    constructor() {
        this.musicSystem = new MusicSystem();
        this.choices = new Map();
    }
}
