const BaseCommand = require('../../structs/base_command.js');

/**
 * @category Commands
 * @extends Command
 */
class Leave extends BaseCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
            category: category,
            guild_only: true,

            name: 'shuffle',
            aliases: [],
            description: 'Shuffle songs in queue.',
            usage: 'shuffle',
            params: [],
            example: 'shuffle'
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
        if (!musicSystem.isDamonInVC(voicechannel)) {
            const newMsg = await this.msgObj.reply('you aren\'t in the bot\'s channel.');

            newMsg.delete({timeout: 5000});

            return;
        }

        musicSystem.queue.shuffle();

        this.textChannel.send('The queue has been shuffled.')
    }
}

module.exports = Leave;
