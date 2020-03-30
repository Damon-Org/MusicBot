const BasicCommand = require('../../utils/basic_command.js');

/**
 * @category Commands
 * @extends Command
 */
class Volume extends BasicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
            category: category,

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
            examples: []
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        const voicechannel = this.voiceChannel;
        if (!voicechannel) {
            const newMsg = await this.msgObj.reply('you aren\'t in a voicechannel');

            newMsg.delete({timeout: 5000});

            return;
        }

        const musicSystem = this.serverInstance.musicSystem;
        if (musicSystem.isDamonInVC(voicechannel)) {
            if (this.args[0] == undefined || this.args[0].length == 0) {
                const newMsg = await this.msgObj.reply('please give a value, command format: `volume #number`.');

                newMsg.delete({timeout: 5000});

                return;
            }

            if (isNaN(this.args[0]) || this.args[0].includes(',')) {
                const newMsg = await this.msgObj.reply('invalid volume level, make sure you give a number and that there\'s no `,` in that number.');

                newMsg.delete({timeout: 5000});

                return;
            }

            const volume = parseInt(this.args[0], 10);

            if (volume < 5 || volume > 200) {
                const newMsg = await this.msgObj.reply('invalid volume level, please give a value between 5 and 200');

                newMsg.delete({timeout: 5000});

                return;
            }

            if (musicSystem.setVolume(volume)) {
                this.textChannel.send(`Volume level has been changed to \`${volume}\`.`);

                return;
            }

            const newMsg = await this.msgObj.reply('volume level unchanged.');

            newMsg.delete({timeout: 5000});

            return;
        }

        const newMsg = await this.msgObj.reply('you aren\'t in the bot\'s channel.');

        newMsg.delete({timeout: 5000});
    }
}

module.exports = Volume;
