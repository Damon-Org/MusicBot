const BaseCommand = require('../../structs/base_command.js');

/**
 * @category Commands
 * @extends Command
 */
class Repeat extends BaseCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
            category: category,
            guild_only: true,

            name: 'repeat',
            aliases: ['loop'],
            description: 'Will repeat the currently playing song.',
            usage: 'repeat',
            params: [],
            example: 'repeat'
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
            if (musicSystem.queue.active() == null) {
                this.msgObj.reply('the currently playing song has been removed, thus it cannot be put in repeat.').then(msg => msg.delete({timeout: 5e3}));

                return;
            }

            if (musicSystem.repeatToggle()) {
                this.textChannel.send('Repeat has been **enabled**.');

                return;
            }

            this.textChannel.send('Repeat has been **disabled**.');

            return;
        }

        this.msgObj.reply('you aren\'t in the bot\'s channel.').then(msg => msg.delete({timeout: 5e3}));
    }
}

module.exports = Repeat;
