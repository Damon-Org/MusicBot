const BasicCommand = require('../../util/basic_command.js');

/**
 * @category Commands
 * @extends Command
 */
class Queue extends BasicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
            category: category,

            name: 'queue',
            aliases: [
                'q'
            ],
            description: 'Will show a queue of all songs.',
            usage: 'queue [page-number]',
            params: [
                {
                    name: 'page-number',
                    description: 'Queue page number',
                    type: 'number',
                    default: 'Shows the first page of queue'
                }
            ],
            examples: [
                'q 2',
                'queue -1'
            ]
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        const
            server = this.msgObj.guild,
            serverInstance = this.serverInstance,
            musicSystem = serverInstance.musicSystem,
            maxPrequeue = musicSystem.queue.maxPrequeue;

        if (!musicSystem.queueExists()) {
            const newMsg = await this.msgObj.reply('No music is playing currently.');

            newMsg.delete({timeout: 5000});
            this.msgObj.delete();

            return;
        }

        const pageSize = 10;
        let
            page = 0,
            bottomLimit = 0,
            topLimit = 0;

        if (this.args[0] == undefined || this.args[0].length == 0) {
            bottomLimit = maxPrequeue + (pageSize * page) - (pageSize / 2),
            topLimit = maxPrequeue + (pageSize * page) + (pageSize / 2);
        }
        else {
            if (isNaN(this.args[0]) || this.args[0].includes('.') || this.args[0].includes(',')) {
                const newMsg = await this.msgObj.reply('invalid page number.');

                newMsg.delete({timeout: 5000});

                return;
            }

            page = parseInt(this.args[0]);

            if (page > 0) {
                page--;
            }

            if (page == 0 || page == 1) {
                bottomLimit = maxPrequeue + (pageSize * page) - (pageSize / 2),
                topLimit = maxPrequeue + (pageSize * page) + (pageSize / 2);
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

            for (let i = bottomLimit; i < topLimit; i++) {
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
                    const richEmbed = new this.db.Discord.MessageEmbed()
                        .setAuthor('Queue for ' + server.name, server.iconURL)
                        .setColor('#252422')
                        .setDescription(embedDescription)
                        .setFooter(`You can use ${serverInstance.prefix}q #number to see other pages of the queue.`);

                    this.textChannel.send(richEmbed);

                    return;
                }
            }

            const richEmbed = new this.db.Discord.MessageEmbed()
                .setAuthor('Queue for ' + server.name, server.iconURL)
                .setColor('#252422')
                .setDescription('This page is empty.')
                .setFooter('You can use !q #number to see other pages of the queue.');

            this.textChannel.send(richEmbed);

            return;
        }

        const newMsg = await this.msgObj.reply('no music is playing currently.');

        newMsg.delete({timeout: 5000});
    }
}

module.exports = Queue;
