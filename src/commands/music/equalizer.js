const
    MusicCommand = require('../../structs/music_command.js'),
    EqualizerPresets = require('../../music/equalizer/presets');

/**
 * @category Commands
 * @extends MusicCommand
 */
class Equalizer extends MusicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(Equalizer, {
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
        if (this.musicSystem.isDamonInVC(this.voiceChannel) && this.musicSystem.queueExists()) {
            const preset = EqualizerPresets[this.args[0]];

            if (!preset) {
                const embed = new this.db.Discord.MessageEmbed()
                    .setTitle('Invalid Equalizer Preset')
                    .setDescription('Choose one of the following:\n```- bass\n- xbass\n- deep\n- flat/normal\n- r&b\n- rock\n- treble\n- vocal```');

                this.reply(embed);

                return true;
            }

            this.musicSystem.player.setEqualizer(preset);

            this.send(`The player equalizer has been changed to \`${this.args[0]}\``);

            return true;
        }

        this.reply('you aren\'t in my voice channel! 😣')
            .then(msg => msg.delete({timeout: 5e3}));

        return true;
    }
}

module.exports = Equalizer;
