const
    BaseCommand = require('../../structs/base_command.js'),
    humanReadableTime = require('humanize-duration');

/**
 * @category Commands
 * @extends BaseCommand
 */
class PlayTime extends BaseCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(PlayTime, {
            category: category,
            guild_only: true,

            name: 'playtime',
            aliases: [
                'pt'
            ],
            description: 'Shows how long the bot has been playing music.',
            usage: 'playtime',
            params: [],
            example: 'playtime'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        if (!this.musicSystem.queueExists()) {
            this.msgObj.reply('No music is playing currently.')
                .then(msg => msg.delete({timeout: 5e3}));

            return true;
        }

        this.send(`Music has been playing for ${humanReadableTime(Math.round((Date.now() - this.serverInstance.musicSystem.startTime) / 1000) * 1000)}`);

        return true;
    }
}

module.exports = PlayTime;
