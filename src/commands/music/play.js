const BasicCommand = require('../../utils/basic_command.js');

/**
 * @category Commands
 * @extends Command
 */
class Play extends BasicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
            category: category,

            name: 'play',
            aliases: [
                'p'
            ],
            description: 'Adds the song you request to queue and plays it.',
            usage: 'play <search>',
            params: [
                {
                    name: 'search',
                    description: 'Search on YouTube or use a YouTube link.',
                    type: 'string',
                    required: true,
                    allow_sentence: true
                }
            ],
            examples: [
                'p https://www.youtube.com/watch?v=rVHn3GOXvzk',
                'play My House Flo Rida'
            ]
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        const voicechannel = this.voiceChannel;
        if (!voicechannel) {
            this.msgObj.reply(`you aren't in a voice channel, join one to use this command.`);

            return;
        }

        if (this.args.length == 0) {
            const newMsg = await this.msgObj.reply(`please give a valid link or a music title to search for.`);
            newMsg.delete({timeout: 5000});

            return;
        }

        const node = this.db.carrier.getNode();
        let data = null;

        if (this.args.length == 1 && (this.args[0].includes('https://') || this.args[0].includes('http://'))) {
            data = await node.rest.resolve(this.args[0]);
        }
        else {
            const searchFor = this.args.join(' ');

            this.musicUtils.createNewChoiceEmbed(this.msgObj, searchFor);

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
            const orig = (new URL(this.args[0])).searchParams.get('v');

            this.musicUtils.createPlaylistFoundEmbed(orig, data, this.msgObj);

            return;
        }

        this.musicUtils.handleSongData(data, this.serverMember, this.msgObj, this.voiceChannel);
    }
}

module.exports = Play;
