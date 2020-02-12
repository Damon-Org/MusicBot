module.exports = class PlayNext {
    /**
     * @param {Object} properties
     */
    constructor(properties) {
        Object.assign(this, properties);
    }

    /**
     * @param {MusicBot} musicBot MusicBot instance
     * @param {Discord.Message} msgObj Discord.js Message Class instance
     * @param {string} command string representing what triggered the command
     * @param {string[]} args array of string arguments
     */
    async onCommand(musicBot, msgObj, command, args) {
        const serverMember = msgObj.member;
        if (!serverMember) {
            msgObj.reply(`Music commands are not supported in Direct Messages.`);
            return;
        }

        const voicechannel = msgObj.member.voice.channel;
        if (!voicechannel) {
            msgObj.reply(`you aren't a in voicechannel, join one to use this command.`);
            return;
        }

        if (args.length == 0) {
            const newMsg = await msgObj.reply(`please give a valid link or a music title to search for.`);
            newMsg.delete({timeout: 5000});

            return;
        }

        const
            musicUtils = musicBot.musicUtils,
            node = musicBot.carrier.getNode();
        let data = null;

        if (args.length == 1 && args[0].includes('https://')) {
            data = await node.rest.resolve(args[0]);
        }
        else {
            const searchFor = args.join(' ');

            musicUtils.createNewChoiceEmbed(msgObj, searchFor, true);

            return;
        }

        if (!data) {
            const richEmbed = new musicBot.Discord.MessageEmbed()
                .setTitle('I could not find the track you requested')
                .setDescription(`No results returned for ${args.join(' ')}.`)
                .setColor('#ed4337');

            msgObj.channel.send(richEmbed);

            return;
        }

        if (Array.isArray(data)) {
            // Playlist found
            const orig = (new URL(args[0])).searchParams.get('v');

            musicBot.musicUtils.createPlaylistFoundEmbed(orig, data, msgObj, true);

            return;
        }

        musicBot.musicUtils.handleSongData(data, msgObj.member, msgObj, voicechannel, true);
    }
}
