const BasicCommand = require('../../util/basic_command.js');

/**
 * @category Commands
 * @extends Command
 */
class PlayNext extends BasicCommand {
    /**
     * @param {Array<*>} args
     */
    constructor(...args) {
        super(...args);
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        const voicechannel = this.voiceChannel;
        if (!voicechannel) {
            msgObj.reply(`you aren't in a voice channel, join one to use this command.`);
            return;
        }

        if (this.args.length == 0) {
            const newMsg = await this.msgObj.reply(`please give a valid link or a music title to search for.`);
            newMsg.delete({timeout: 5000});

            return;
        }

        const node = this.musicBot.carrier.getNode();
        let data = null;

        if (this.args.length == 1 && (this.args[0].includes('https://') || this.args[0].includes('http://'))) {
            data = await node.rest.resolve(args[0]);
        }
        else {
            const searchFor = args.join(' ');

            this.musicUtils.createNewChoiceEmbed(this.msgObj, searchFor, true);

            return;
        }

        if (!data) {
            const richEmbed = new this.musicBot.Discord.MessageEmbed()
                .setTitle('I could not find the track you requested')
                .setDescription(`No results returned for ${args.join(' ')}.`)
                .setColor('#ed4337');

            this.textChannel.send(richEmbed);

            return;
        }

        if (Array.isArray(data)) {
            // Playlist found
            const orig = (new URL(args[0])).searchParams.get('v');

            this.musicUtils.createPlaylistFoundEmbed(orig, data, this.msgObj, true);

            return;
        }

        this.musicUtils.handleSongData(data, this.serverMember, this.msgObj, this.voiceChannel, true);
    }
}

module.exports = PlayNext;
