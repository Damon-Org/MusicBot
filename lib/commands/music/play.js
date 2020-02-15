const Command = require('../../util/command.js');

/**
 * @category Commands
 * @extends Command
 */
class Play extends Command {
    /**
     * @param {Object} properties
     */
    constructor(properties) {
        super(properties);
    }

    /**
     * @param {MusicBot} musicBot MusicBot instance
     * @param {external:Discord_Message} msgObj Discord.js Message Class instance
     * @param {external:String} command string representing what triggered the command
     * @param {external:String[]} args array of string arguments
     */
    async onCommand(musicBot, msgObj, command, args) {
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

        if (args.length == 1 && (args[0].includes('https://') || args[0].includes('http://'))) {
            data = await node.rest.resolve(args[0]);
        }
        else {
            const searchFor = args.join(' ');

            musicUtils.createNewChoiceEmbed(msgObj, searchFor);

            return;
        }

        if (!data) {
            const richEmbed = new musicBot.Discord.MessageEmbed()
                .setTitle('No results returned.')
                .setDescription(`I could not find the track you requested or access to this track is limited.\nPlease try again with something other than ${args.join(' ')}.`)
                .setColor('#ed4337');

            msgObj.channel.send(richEmbed);

            return;
        }

        if (Array.isArray(data)) {
            // Playlist found
            const orig = (new URL(args[0])).searchParams.get('v');

            musicBot.musicUtils.createPlaylistFoundEmbed(orig, data, msgObj);

            return;
        }

        musicBot.musicUtils.handleSongData(data, msgObj.member, msgObj, voicechannel);
    }
}

module.exports = Play;
