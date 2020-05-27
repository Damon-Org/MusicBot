const BaseCommand = require('../../structs/base_command');

/**
 * @category Commands
 * @extends BaseCommand
 */
class ForceReset extends BaseCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(ForceReset, {
            category: category,
            guild_only: true,
            hidden: true,

            name: 'force reset',
            aliases: [
                'emergency reset',
                'freset'
            ],
            description: 'Force reset the Music System if for some reason it got stuck.',
            usage: 'force reset',
            params: [],
            example: 'force reset'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        if (!this.voiceChannel) {
            this.reply('where are you? I can\'t seem to find you in any voice channel. <:thinking_hard:560389998806040586>')
                .then(msg => msg.delete({timeout: 5e3}));

            return true;
        }

        this.musicSystem.shutdown.instant();

        this.reply('the Music System has been reset.')
            .then(msg => msg.delete({timeout: 5e3}));

        return true;
    }
}

module.exports = ForceReset;
