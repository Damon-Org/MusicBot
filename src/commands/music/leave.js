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

            name: 'leave',
            aliases: [
                'quit',
                'exit',
                'stop'
            ],
            description: 'Bot will stop music playback and leave channel',
            usage: 'leave',
            params: [],
            example: 'leave'
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

        if (musicSystem.isDamonInVC(voicechannel) || musicSystem.shutdown.type()) {
            this.textChannel.send('Music playback has been stopped by leave command.');

            musicSystem.shutdown.instant();
            return;
        }

        this.msgObj.reply('you aren\'t in the bot\'s channel or is not done playing music.').then(msg => msg.delete({timeout: 5e3}));
    }
}

module.exports = Leave;
