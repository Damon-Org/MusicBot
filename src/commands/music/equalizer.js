const
    BaseCommand = require('../../structs/base_command'),
    EqualizerPresets = require('../../music/equalizer/presets');

/**
 * @category Commands
 * @extends Command
 */
class Equalizer extends BaseCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
            category: category,
            guild_only: true,

            name: 'equalizer',
            aliases: [
                'eq',
            ],
            description: 'Change the equalizer to one of the presets.',
            usage: 'eq <preset>',
            params: [
                {
                    name: 'preset',
                    description: 'A preset name.',
                    type: 'string',
                    required: true
                }
            ],
            example: 'eq deep'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        const
            voicechannel = this.voiceChannel,
            musicSystem = this.serverInstance.musicSystem;
        if (!voicechannel && !musicSystem.shutdown.type()) {
            this.msgObj.reply('you aren\'t in a voicechannel').then(msg => msg.delete({timeout: 5e3}));

            return;
        }

        if (musicSystem.isDamonInVC(voicechannel) && musicSystem.queueExists()) {
            const preset = EqualizerPresets[this.args[0]];

            if (!preset) {
                const embed = new this.db.Discord.MessageEmbed()
                    .setTitle('Invalid Equalizer Preset')
                    .setDescription('Choose one of the following:\n```- bass\n- xbass\n- deep\n- flat/normal\n- r&b\n- rock\n- treble\n- vocal```');

                this.reply(embed);

                return;
            }

            musicSystem.player.setEqualizer(preset);

            this.send(`The player equalizer has been changed to \`${this.args[0]}\``);

            return;
        }

        this.msgObj.reply('you aren\'t in the bot\'s channel.').then(msg => msg.delete({timeout: 5e3}));
    }
}

module.exports = Equalizer;
