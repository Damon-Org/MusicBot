const BaseCommand = require('../../structs/base_command.js');

/**
 * @category Commands
 * @extends Command
 */
class Volume extends BaseCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
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
        const voicechannel = this.voiceChannel;
        if (!voicechannel) {
            this.msgObj.reply('you aren\'t in a voicechannel').then(msg => msg.delete({timeout: 5e3}));

            return;
        }

        const musicSystem = this.serverInstance.musicSystem;
        if (musicSystem.isDamonInVC(voicechannel)) {
            if (this.args[0] == undefined || this.args[0].length == 0) {
                this.msgObj.reply('please give a value, command format: `volume #number`.').then(msg => msg.delete({timeout: 5e3}));

                return;
            }

            if (isNaN(this.args[0]) || this.args[0].includes(',')) {
                this.msgObj.reply('invalid volume level, make sure you give a number and that there\'s no `,` in that number.').then(msg => msg.delete({timeout: 5e3}));

                return;
            }

            const volume = parseInt(this.args[0], 10);

            if (volume < 5 || volume > 200) {
                this.msgObj.reply('invalid volume level, please give a value between 5 and 200').then(msg => msg.delete({timeout: 5e3}));

                return;
            }

            if (musicSystem.setVolume(volume)) {
                this.textChannel.send(`Volume level has been changed to \`${volume}\`.`);

                return;
            }

            this.msgObj.reply('volume level unchanged.');

            return;
        }

        this.msgObj.reply('you aren\'t in the bot\'s channel.').then(msg => msg.delete({timeout: 5e3}));
    }
}

module.exports = Volume;
