const Command = require('../../util/command.js');

/**
 * Class name speaks for itself
 * @category Commands
 * @extends Command
 */
class UpdateServers extends Command {
    /**
     * @param {Object} properties
     */
    constructor(properties) {
        super(properties);
    }

    /**
     * @param {MusicBot} musicBot MusicBot instance
     * @param {external:Discord_Message} msgObj Discord.js Message Class instance
     * @param {external:String} command string representing what triggered the command
     * @param {external:String[]} args array of string arguments
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

module.exports = UpdateServers;
