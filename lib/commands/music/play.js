module.exports = class Play {
    constructor() {

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

        const voiceChannel = msgObj.member.voiceChannel;
        if (!voiceChannel) {
            msgObj.reply(`you aren't a in voicechannel, join one to use this command.`);
            return;
        }

        if (args.length == 0) {
            const newMsg = await msgObj.reply(`please give a valid link or a music title to search for.`);
            newMsg.delete(2500);

            return;
        }

        const
            musicUtils = musicBot.musicUtils,
            [response, song] = await musicUtils.isValidDomain(args[0]);

        let
            newMsg = null,
            valid = false;

        switch (response) {
            case 1: {
                valid = true;

                break;
            }
            case 2: {
                newMsg = await msgObj.reply('this link is not supported.');

                break;
            }
            case 3: {
                newMsg = await msgObj.reply('your link appears to be broken, please try again with a proper link.');

                break;
            }
            case 4: {
                newMsg = await msgObj.reply('this domain is not yet supported but we\'re planning on adding support in the future.');

                break;
            }
            case 5: {
                // the variable song is in this case an error stack
                msgObj.channel.send(`Unknown error occured while parsing your search request\nThis generated the following error: \`\`\`js\n${song}\`\`\`Contact Yimura#9999 on Discord if this keeps occuring.`);

                break;
            }
            default: {
                const searchFor = args.join(' ');

                musicUtils.createNewChoiceEmbed(msgObj, searchFor);

                return;
            }
        }

        if (! await musicUtils.checkBrokenSong(song)) {
            newMsg = await msgObj.reply('your link appears to be broken, please try again with a proper link.');

            valid = false;
        }

        if (!valid) {
            if (newMsg !== null) {
                newMsg.delete(2500);
            }

            return;
        }

        const musicSystem = (musicBot.serverUtils.getClassInstance(msgObj.guild.id)).musicSystem;

        song.setRequester(serverMember);

        if (song.list != null) {
            musicSystem.playlistEmbed(msgObj, voiceChannel, song);
            return;
        }

        if (musicSystem.queueExists()) {
            if (musicSystem.isDamonInVC(voiceChannel)) {
                await musicSystem.addToQueue(song);
                msgObj.channel.send(`Added song **${song.getTitle()}**`);

                return;
            }

            const newMsg = await msgObj.reply(`you aren't in the bot's channel.`);

            newMsg.delete(3500);

            return;
        }

        await musicSystem.createQueue(song, msgObj.channel);
        musicSystem.startQueue(voiceChannel);

        msgObj.channel.send(`Playback starting with **${song.getTitle()}**`);
    }
}
