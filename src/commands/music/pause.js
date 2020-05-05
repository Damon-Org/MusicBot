const BaseCommand = require('../../structs/base_command.js');

/**
 * @category Commands
 * @extends Command
 */
class Pause extends BaseCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
            category: category,
            guild_only: true,

            name: 'pause',
            aliases: [],
            description: 'Music playback will be paused.',
            usage: 'pause',
            params: [],
            example: 'pause'
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
            if (musicSystem.pausePlayback()) {
                this.textChannel.send('Music playback has been paused.');

                return;
            }

            const newMsg = await this.msgObj.reply('music is already paused, use `resume` command to continue playing.');

            newMsg.delete({timeout: 5000});

            return;
        }

        const newMsg = await this.msgObj.reply('you aren\'t in the bot\'s channel.');

        newMsg.delete({timeout: 5000});
    }
}

module.exports = Pause;
