module.exports = class Queue {
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
        const
            server = msgObj.guild,
            serverId = server.id,
            serverInstance = musicBot.serverUtils.getClassInstance(serverId),
            musicSystem = serverInstance.musicSystem,
            maxPrequeue = musicSystem.queue.maxPrequeue;

        if (!musicSystem.queueExists()) {
            const newMsg = await msgObj.reply('No music is playing currently.');

            newMsg.delete({timeout: 5000});
            msgObj.delete();

            return;
        }

        const pageSize = 10;
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

                newMsg.delete({timeout: 5000});

                return;
            }

            page = parseInt(args[0]);

            if (page >= 0) {
                if (page != 0) {
                    page--;
                }
            }

            if (page == 0) {
                bottomLimit = maxPrequeue + (pageSize * page);
                topLimit = maxPrequeue + (pageSize * page) + 1;
            }
            else {
                bottomLimit = maxPrequeue + (pageSize * page) - (pageSize / 2);
                topLimit = maxPrequeue + (pageSize * page) + (pageSize / 2);

                if (bottomLimit < 0) bottomLimit = 0;
            }
        }

        if (musicSystem.queueExists()) {
            const length = musicSystem.queue.size();
            let embedDescription = '';

            console.log('bottomLimit: '+ bottomLimit + '\ntopLimit: '+ topLimit);
            for (let i = bottomLimit; i < topLimit; i++) {
                console.log('Queue: ' + i);
                if (i == maxPrequeue) {
                    if (musicSystem.queue.get(maxPrequeue) == null && (musicSystem.queue.get(maxPrequeue - 1) == null && musicSystem.queue.get(maxPrequeue + 1) == null)) {
                        continue;
                    }
                }
                else if (musicSystem.queue.get(i) == null) {
                    continue;
                }

                const track = musicSystem.queue.get(i);

                if (i < maxPrequeue) {
                    if (embedDescription.length == 0) {
                        embedDescription = `\`\`\`asciidoc\n[PREVIOUSLY${(page != 0) ? ' – Page ' + Math.abs(page - 1) : ''}]\`\`\`\n`;
                    }

                    embedDescription += `\`\`\`asciidoc\n[${(i - maxPrequeue)}] :: ${track.getTitle()}\`\`\``;
                }

                if (i == maxPrequeue) {
                    if (track == null) {
                        embedDescription += `\n\n\`\`\`md\n< NOW PLAYING >\n{ SONG HAS BEEN REMOVED }\`\`\``;
                    }
                    else {
                        embedDescription += `\n\n\`\`\`md\n< NOW PLAYING >\n${track.getTitle()}\`\`\``;
                    }
                }

                if (i == (maxPrequeue + 1) || embedDescription.length == 0) {
                    embedDescription += `\n\n\`\`\`ini\n[NEXT UP${(page != 0) ? ' – Page ' + (page + 1) : ''}]\`\`\`\n`;
                }

                if (i > maxPrequeue) {
                    embedDescription += `\`\`\`ini\n[${i - maxPrequeue + 1}] ${track.getTitle()}\`\`\``;
                }

                if (i == (topLimit - 1) || i == (length - 2)) {
                    const richEmbed = new musicBot.Discord.MessageEmbed()
                        .setAuthor('Queue for ' + server.name, server.iconURL)
                        .setColor('#252422')
                        .setDescription(embedDescription)
                        .setFooter(`You can use ${serverInstance.prefix}q #number to see other pages of the queue.`);

                    msgObj.channel.send(richEmbed);

                    return;
                }
            }

            const richEmbed = new musicBot.Discord.MessageEmbed()
                .setAuthor('Queue for ' + server.name, server.iconURL)
                .setColor('#252422')
                .setDescription('This page is empty.')
                .setFooter('You can use !q #number to see other pages of the queue.');

            msgObj.channel.send(richEmbed);

            return;
        }

        const newMsg = await msgObj.reply('no music is playing currently.');

        newMsg.delete({timeout: 5000});
    }
}
