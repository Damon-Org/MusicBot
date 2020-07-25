import MusicCommand from '../../structures/commands/MusicCommand.js'

export default class Play extends MusicCommand {
    /**
     * @param {String} category
     * @param {Array<String>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(Play, {
            category: category,
            guild_only: true,

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
            example: 'play https://www.youtube.com/watch?v=rVHn3GOXvzk'
        });
    }

    /**
     * @param {String} command string representing what triggered the command
     */
    async run(command) {
        if (this.args.length == 0) {
            this.reply('I can\'t search for nothing... Please give me something to search for.')
                .then(msg => msg.delete({timeout: 5e3}));

            return false;
        }

        const noticeMsg = this.send('🔍 `Looking up your request...` 🔍');

        return this.music.util.handleRequest(this.args, this.msgObj, this.serverMember, this.voiceChannel, noticeMsg);
    }
}
