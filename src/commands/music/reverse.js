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

            name: 'reverse',
            aliases: [],
            description: 'Reverse the queue.',
            usage: 'reverse',
            params: [],
            example: 'reverse'
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
        if (!musicSystem.isDamonInVC(voicechannel)) {
            this.msgObj.reply('you aren\'t in the bot\'s channel.').then(msg => msg.delete({timeout: 5e3}));

            return;
        }

        musicSystem.queue.reverse();

        this.textChannel.send('🔄 The queue has been reversed, you can use `restart` to start from the beginning of the queue. 🔄');
    }
}

module.exports = Leave;
