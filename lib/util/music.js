const Song = require('../music/song.js');

module.exports = class MusicUtils {
    /**
     * @constructs
     * @param {MusicBot} musicBot MusicBot instance
     */
    constructor(musicBot) {
        this.musicBot = musicBot;
    }

    /**
     * @param {Song} song A Song instance
     */
    async checkBrokenSong(song) {
        // Wil return true no matter what as the api is not setup yet
        return true;
    }

    /**
     * Creates a new ChoiceEmbed embed
     * @param {Discord.Message} msgObj A Discord Message instance
     * @param {String} searchFor A string to search for in the Youtube API
     * @param {Boolean} exception If the song should be added next up
     */
    async createNewChoiceEmbed(msgObj, searchFor, exception = false) {
        const
            serverId = msgObj.guild.id,
            requester = msgObj.member,
            voicechannel = requester.voiceChannel,
            serverInstance = this.musicBot.serverUtils.getClassInstance(serverId);

        if (! await serverInstance.addChoice(requester, searchFor, exception)) {
            const richEmbed = new this.musicBot.Discord.RichEmbed()
                .setTitle('I could not find the song you requested')
                .setDescription(`No results returned from ${searchFor}.`)
                .setColor('#ed4337');

            msgObj.channel.send(richEmbed);

            return;
        }

        const choice = serverInstance.choices.get(requester.user.id);

        const richEmbed = new this.musicBot.Discord.RichEmbed()
            .setColor('#252422')
            .setDescription(choice.getDescription())
            .setFooter('Choose a song by clicking the matching reaction below');

        const newMsg = await msgObj.channel.send(richEmbed);
        choice.setListener(newMsg);
        choice.setVoiceChannel(voicechannel);

        // const emojis = ['\u0030\u20E3','\u0031\u20E3','\u0032\u20E3','\u0033\u20E3','\u0034\u20E3','\u0035\u20E3', '\u0036\u20E3','\u0037\u20E3','\u0038\u20E3','\u0039\u20E3'];
        const emojis = ['\u0031\u20E3','\u0032\u20E3','\u0033\u20E3','\u0034\u20E3','\u0035\u20E3', '🚫'];
        // Custom for loop that interprets discord's trash delay
        async function react() {
            for (let i = 0; i < emojis.length; i++) {
                try {
                    await newMsg.react(emojis[i]);
                } catch (e) { console.log(e); }
            }
        }

        react();
    }

    /**
     * This function will check if a domain is valid and supported in our system, if so it'll return a new Song()
     * @param {string} possibleDomain Value to check if valid domain
     * @returns {Array} Boolean value if succeeded and a new Song()
     */
    async isValidDomain(possibleDomain) {
        try {
            const
                url = new URL(possibleDomain),
                domain = url.hostname;

            let
                id = null,
                source = null;

            if (domain.includes('youtube') || domain.includes('youtu.be')) {
                source = 'yt';

                if (domain == 'youtu.be') {
                    id = url.pathname.split('/')[1];

                    if (id == '') {
                        id = null;
                    }
                }
                else {
                    const queryParams = url.searchParams;

                    id = queryParams.get('v');
                }
            }
            else if (domain.includes('soundcloud.com')) {
                // not yet supported
                return [4, null];
            }
            else {
                return [2, null];
            }

            if (id == undefined || id == null) {
                return [3, null];
            }

            const song = new Song(id, source);

            return [1, song];
        } catch (e) {
            if (e.code == 'ERR_INVALID_URL') {
                return [0, null];
            }

            return [5, e.stack];
        }
    }
}
