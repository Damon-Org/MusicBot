const BasicCommand = require('../../util/basic_command.js');

/**
 * @category Commands
 * @extends Command
 */
class Previous extends BasicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
            category: category,

            name: 'previous',
            aliases: [
                'back'
            ],
            description: 'Will start playing the previous song in queue.',
            usage: 'previous',
            params: [],
            example: 'previous'
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

        if (this.serverInstance.musicSystem.isDamonInVC(voicechannel)) {
            this.serverInstance.musicSystem.playPrevious();

            this.msgObj.react('⏮️');

            return;
        }

        const newMsg = await this.msgObj.reply('you aren\'t in the bot\'s channel.');

        newMsg.delete({timeout: 5000});
    }
}

module.exports = Previous;
