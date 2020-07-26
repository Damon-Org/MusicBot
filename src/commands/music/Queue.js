import BaseCommand from '../../structures/commands/BaseCommand.js'

export default class Queue extends BaseCommand {
    /**
     * @param {String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(Queue, {
            category: category,
            guild_only: true,

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
            example: 'queue 2'
        });
    }

    get music() {
        return this.server.music;
    }

    /**
     * @param {String} command string representing what triggered the command
     */
    async run(command) {
        const
            server = this.msgObj.guild,
            maxPrequeue = this.music.queue.maxPrequeue;

        if (!this.music.queueExists()) {
            this.reply('No music is playing currently.')
                .then(msg => msg.delete({timeout: 5e3}));

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
                this.reply('sorry, I can\'t seem to find any tracks on the page you gave me.')
                    .then(msg => msg.delete({timeout: 5e3}));

                return true;
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

        if (this.music.queueExists()) {
            const length = this.music.queue.length;
            let embedDescription = '';

            for (let i = bottomLimit; i < topLimit; i++) {
                if (i == maxPrequeue) {
                    if (this.music.queue[maxPrequeue] == null && (this.music.queue[maxPrequeue - 1] == null && this.music.queue[maxPrequeue + 1] == null)) {
                        continue;
                    }
                }
                else if (this.music.queue[i] == null) {
                    continue;
                }

                const track = this.music.queue[i];
                if (!track) continue;

                if (i < maxPrequeue) {
                    if (embedDescription.length == 0) {
                        embedDescription = `\`\`\`asciidoc\n[PREVIOUSLY${(page != 0) ? ' – Page ' + Math.abs(page - 1) : ''}]\`\`\`\n`;
                    }

                    embedDescription += `\`\`\`asciidoc\n[${(i - maxPrequeue)}] :: ${track.title}\`\`\``;
                }

                if (i == maxPrequeue) {
                    if (track == null) {
                        embedDescription += `\n\n\`\`\`md\n< NOW PLAYING >\n{ SONG HAS BEEN REMOVED }\`\`\``;
                    }
                    else {
                        embedDescription += `\n\n\`\`\`md\n< NOW PLAYING >\n${track.title}\`\`\``;
                    }
                }

                if (i == (maxPrequeue + 1) || embedDescription.length == 0) {
                    embedDescription += `\n\n\`\`\`ini\n[NEXT UP${(page != 0) ? ' – Page ' + (page + 1) : ''}]\`\`\`\n`;
                }

                if (i > maxPrequeue && track) {
                    embedDescription += `\`\`\`ini\n[${i - maxPrequeue + 1}] ${track.title}\`\`\``;
                }

                if (i == (topLimit - 1) || i == (length - 2)) {
                    const richEmbed = new this.Discord.MessageEmbed()
                        .setAuthor('Queue for ' + server.name, server.iconURL)
                        .setColor('#252422')
                        .setDescription(embedDescription)
                        .setFooter(`You can use ${this.server.prefix}q #number to see other pages of the queue.`);

                    this.send(richEmbed);

                    return true;
                }
            }

            const richEmbed = new this.Discord.MessageEmbed()
                .setAuthor('Queue for ' + server.name, server.iconURL)
                .setColor('#252422')
                .setDescription('This page is empty.')
                .setFooter(`You can use ${this.server.prefix}q #number to see other pages of the queue.`);

            this.send(richEmbed);

            return true;
        }

        this.reply('no music is playing currently.')
            .then(msg => msg.delete({timeout: 5e3}));

        return true;
    }
}