const
    BaseCommand = require('../../structs/base_command'),
    EqualizerPresets = require('../../music/equalizer/presets');

/**
 * @category Commands
 * @extends Command
 */
class ForceReset extends BaseCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
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
        const
            voicechannel = this.voiceChannel,
            musicSystem = this.serverInstance.musicSystem;

        if (!voicechannel) {
            this.msgObj.reply('you aren\'t in a voicechannel').then(msg => msg.delete({timeout: 5e3}));

            return;
        }

        musicSystem.shutdown.instant();

        this.msgObj.reply('the Music System has been reset.').then(msg => msg.delete({timeout: 5e3}));
    }
}

module.exports = ForceReset;
