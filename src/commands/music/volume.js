const MusicCommand = require('../../structs/music_command.js');

/**
 * @category Commands
 * @extends MusicCommand
 */
class Volume extends MusicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(Volume, {
            category: category,
            guild_only: true,

            name: 'volume',
            aliases: [
                "vol",
                "v"
            ],
            description: 'Change the music volume.',
            usage: 'volume [volume]',
            params: [
                {
                    name: 'volume',
                    description: 'A number ranging from 1 to 200',
                    type: 'number',
                    default: 'Will show the current volume.'
                }
            ],
            example: 'volume 50'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        if (this.musicSystem.isDamonInVC(this.voiceChannel)) {
            if (this.args[0] == undefined || this.args[0].length == 0) {
                this.reply('please give a value, command format: `volume #number`.')
                    .then(msg => msg.delete({timeout: 5e3}));

                return true;
            }

            if (isNaN(this.args[0]) || this.args[0].includes(',')) {
                this.reply('invalid volume level, make sure you give a number and that there\'s no `,` in that number.')
                    .then(msg => msg.delete({timeout: 5e3}));

                return true;
            }

            const volume = parseInt(this.args[0], 10);
            if (volume < 5 || volume > 200) {
                this.reply('invalid volume level, please give a value between 5 and 200')
                    .then(msg => msg.delete({timeout: 5e3}));

                return true;
            }

            if (this.musicSystem.setVolume(volume)) {
                this.send(`Volume level has been changed to \`${volume}\`.`);

                return true;
            }

            this.reply('volume level unchanged.');

            return true;
        }

        this.reply('you aren\'t in my voice channel! 😣')
            .then(msg => msg.delete({timeout: 5e3}));

        return true;
    }
}

module.exports = Volume;
