const BaseCommand = require('../../structs/base_command.js');

/**
 * @category Commands
 * @extends BaseCommand
 */
class ErrorData extends BaseCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(ErrorData, {
            category: category,
            guild_only: true,
            hidden: true,

            name: 'music data',
            aliases: [
                'error data'
            ],
            description: 'Print the latest error data from the bot',
            usage: 'music data',
            params: [],
            example: 'music data'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        const embed = new this.db.Discord.MessageEmbed()
            .setTitle('Music System Data')
            .setDescription(`This is the latest data present:\n\`\`\`${JSON.stringify(this.musicSystem.endMsg, null, '    ')}\`\`\`\nWith the following song: ${this.musicSystem.lastSong.title}`);

        this.send(embed);

        return true;
    }
}

module.exports = ErrorData;
