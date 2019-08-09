const Server = require('../server.js');

module.exports = class ServerUtils {
    /**
     * @param {MusicBot} musicBot MusicBot instance
     */
    constructor(musicBot) {
        this.musicBot = musicBot;
    }

    /**
     * @param {string|number} serverId A string or number that identifies a guild
     */
    static getClassInstance(serverId) {
        let serverMap = this.musicBot.servers;

        if (serverMap.has(serverId)) {
            return serverMap.get(serverId);
        }

        const instance = new Server();
        this.musicBot.set(serverId, instance);

        return instance;
    }
}
