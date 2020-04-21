const BasicCommand = require('../../util/basic_command.js');

/**
 * @category Commands
 * @extends Command
 */
class PlayNext extends BasicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
            category: category,

            name: 'play next',
            aliases: [
                'pn',
                'playnext'
            ],
            description: 'Adds song directly after currently playing song, if no music is playing a queue will be created and the song will be played instead.',
            usage: 'play next <search>',
            params: [
                {
                    name: 'search',
                    description: 'Search on YouTube or use a YouTube link.',
                    type: 'string',
                    required: true,
                    allow_sentence: true
                }
            ],
            example: 'play https://www.youtube.com/watch?v=rVHn3GOXvzk'
        });
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

        const
            noticeMsg = this.textChannel.send('🔍 `Looking up your request...` 🔍'),
            node = this.db.carrier.getNode();
        let data = null;

        if (this.args.length == 1 && (this.args[0].includes('https://') || this.args[0].includes('http://'))) {
            data = await node.rest.resolve(this.args[0]);
        }
        else {
            const searchFor = this.args.join(' ');

            this.musicUtils.createNewChoiceEmbed(this.msgObj, searchFor, noticeMsg, true);

            return;
        }

        if (!data) {
            const richEmbed = new this.db.Discord.MessageEmbed()
                .setTitle('I could not find the track you requested')
                .setDescription(`No results returned for ${this.args.join(' ')}.`)
                .setColor('#ed4337');

            this.textChannel.send(richEmbed);

            return;
        }

        if (Array.isArray(data)) {
            // Playlist found
            const orig = (new URL(args[0])).searchParams.get('v');

            this.musicUtils.createPlaylistFoundEmbed(orig, data, this.msgObj, noticeMsg, true);

            return;
        }

        this.musicUtils.handleSongData(data, this.serverMember, this.msgObj, this.voiceChannel, noticeMsg, true);
    }
}

module.exports = PlayNext;
