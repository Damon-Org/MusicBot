module.exports = class UpdateServers {
    /**
     * @param {Object} properties
     */
    constructor(properties) {
        Object.assign(this, properties);
    }

    /**
     * @param {MusicBot} musicBot MusicBot instance
     * @param {Discord.Message} msgObj Discord.js Message Class instance
     * @param {String} command string representing what triggered the command
     * @param {String[]} args array of string arguments
     */
    async onCommand(musicBot, msgObj, command, args) {
        const
            userId = msgObj.author.id,
            serverId = msgObj.author.id;

        if (! await musicBot.userUtils.hasRequiredMinimalRole(userId, 2)) {
            // ignore request to not let users know this command exists

            return;
        }

        const servers = musicBot.client.guilds;
        for (let server of servers) {
            musicBot.serverUtils.addGuildIfNotExists(server[1]);
        }

        msgObj.author.send('Updated servers in DB.');
    }
}
