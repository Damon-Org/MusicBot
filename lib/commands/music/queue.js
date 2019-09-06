module.exports = class Queue {
    constructor() {

    }

    /**
     * @param {MusicBot} musicBot MusicBot instance
     * @param {Message} msgObj Discord.js Message Class instance
     * @param {string} command string representing what triggered the command
     * @param {string[]} args array of string arguments
     */
    async onCommand(musicBot, msgObj, command, args) {
        const
            server = msgObj.guild,
            serverId = server.id,
            musicSystem = (musicBot.serverUtils.getClassInstance(serverId)).musicSystem,
            maxPrequeue = musicSystem.queue.maxPrequeue;

        if (!musicSystem.queueExists()) {
            const newMsg = await msgObj.reply('No music is playing currently.');

            newMsg.delete(3500);
            msgObj.delete();

            return;
        }

        const pageSize = 10;;
        let
            page = 0,
            bottomLimit = 0,
            topLimit = 0;

        if (args[0] == undefined || args[0].length == 0) {
            bottomLimit = maxPrequeue + (pageSize * page) - (pageSize / 2),
            topLimit = maxPrequeue + (pageSize * page) + (pageSize / 2);
        }
        else {
            if (isNaN(args[0]) || args[0].includes('.') || args[0].includes(',')) {
                const newMsg = await msgObj.reply('invalid page number.');

                newMsg.delete(3500);

                return;
            }

            page = parseInt(args[0], 10);

            if (page >= 0) {
                if (page != 0) {
                    page--;
                }
            }

            bottomLimit = maxPrequeue + (pageSize * page) - (pageSize / 2),
            topLimit = maxPrequeue + (pageSize * page) + (pageSize / 2);
        }

        if (musicSystem.queueExists()) {
            const length = musicSystem.queue.size();
            let
                embedDescription = '',
                song = null;

            for (let i = bottomLimit; i < topLimit; i++) {
                if (i == maxPrequeue) {
                    if (musicSystem.queue.get(maxPrequeue) == null && (musicSystem.queue.get(maxPrequeue - 1) == null && musicSystem.queue.get(maxPrequeue + 1) == null)) {
                        continue;
                    }
                }
                else if (musicSystem.queue.get(i) == null) {
                    continue;
                }

                const song = musicSystem.queue.get(i);

                if (i < maxPrequeue) {
                    if (embedDescription.length == 0) {
                        embedDescription = `\`\`\`asciidoc\n[PREVIOUSLY${(page != 0) ? ' – Page ' + Math.abs(page - 1) : ''}]\`\`\`\n`;
                    }

                    embedDescription += `\`\`\`asciidoc\n[${(i - maxPrequeue)}] :: ${song.getTitle()}\`\`\``;

                    continue;
                }

                if (i == maxPrequeue) {
                    if (song == null) {
                        embedDescription += `\n\n\`\`\`md\n< NOW PLAYING >\n{ SONG HAS BEEN REMOVED }\`\`\``;

                        continue;
                    }
                    embedDescription += `\n\n\`\`\`md\n< NOW PLAYING >\n${song.getTitle()}\`\`\``;

                    continue;
                }

                if (i == (maxPrequeue + 1) || embedDescription.length == 0) {
                    embedDescription += `\n\n\`\`\`ini\n[NEXT UP${(page != 0) ? ' – Page ' + (page + 1) : ''}]\`\`\`\n`;
                }

                embedDescription += `\`\`\`ini\n[${i - maxPrequeue + 1}] ${song.getTitle()}\`\`\``;

                if (i == (topLimit - 1) || i == (length - 2)) {
                    const richEmbed = new musicBot.Discord.RichEmbed()
                        .setAuthor('Queue for ' + server.name, server.iconURL)
                        .setColor('#252422')
                        .setDescription(embedDescription)
                        .setFooter('You can use !q #number to see other pages of the queue.');

                    msgObj.channel.send(richEmbed);

                    return;
                }
            }

            const richEmbed = new musicBot.Discord.RichEmbed()
                .setAuthor('Queue for ' + server.name, server.iconURL)
                .setColor('#252422')
                .setDescription('This page is empty.')
                .setFooter('You can use !q #number to see other pages of the queue.');

            msgObj.channel.send(richEmbed);

            return;
        }

        const newMsg = await msgObj.reply('no music is playing currently.');

        newMsg.delete(3500);
    }
}
