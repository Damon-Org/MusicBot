module.exports = class Play {
    /**
     * @param {Object} properties
     */
    constructor(properties) {
        Object.assign(this, properties);
    }

    /**
     * @param {MusicBot} musicBot MusicBot instance
     * @param {Discord.Message} msgObj Discord.js Message Class instance
     * @param {String} command string representing what triggered the command
     * @param {String[]} args array of string arguments
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

            musicUtils.createNewChoiceEmbed(msgObj, searchFor);

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

        const musicSystem = (musicBot.serverUtils.getClassInstance(msgObj.guild.id)).musicSystem;

        if (musicSystem.queueExists()) {
            if (musicSystem.isDamonInVC(voicechannel)) {
                const err = await musicSystem.addToQueue(data, serverMember);
                if (err) {
                    musicBot.error(err.stack);
                    msgObj.channel.send(`The following error occured while trying to play this song:\`\`\`${err.stack}\`\`\``);

                    return;
                }

                msgObj.channel.send(`Added song **${data.info.title}**`);

                return;
            }

            const newMsg = await msgObj.reply(`you aren't in the bot's channel.`);

            newMsg.delete({timeout: 5000});

            return;
        }

        const err = await musicSystem.createQueue(data, serverMember, msgObj.channel);
        if (err) {
            musicBot.error(err.stack);
            msgObj.channel.send(`The following error occured while trying to play this song:\`\`\`${err.stack}\`\`\``);

            this.reset();
            return;
        }

        musicSystem.startQueue(voicechannel);

        msgObj.channel.send(`Playback starting with **${data.info.title}**`);
    }
}
