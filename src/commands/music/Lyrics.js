import { MessageEmbed } from 'discord.js'

import MusicCommand from '../../structures/commands/MusicCommand.js'

export default class Lyrics extends MusicCommand {
    /**
     * @param {String} category
     * @param {Array<String>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(Lyrics, {
            category: category,
            guild_only: true,

            name: 'lyrics',
            aliases: [
                'l'
            ],
            description: 'Finds the lyrics of the current song, or searches lyrics for a given song.',
            usage: 'lyrics <query (optional)>',
            params: [
                {
                    name: 'query',
                    description: 'E.g. The name of the artist and the song.',
                    type: 'string',
                    required: false,
                    allow_sentence: true
                }
            ],
            example: 'lyrics Alvaro Soler La Cintura'
        });
    }

    /**
     * @param {String} command string representing what triggered the command
     */
    async run(command) {
        const active = this.music.queue.active();

        let title = null,
            artist = null,
            lyric = null;

        if (this.args.length == 0) {
            if (active === null) {
                this.reply('There is no active song playing at the moment. Please enter a search query instead.')
                    .then(msg => msg.delete({timeout: 5e3}));

                return false;
            }

            title = active.name;
            artist = active.artists[0].name;
        }

        if (title && artist)
            lyric = await this._m.modules.lyrics.fetch(`${title} ${artist}`);
        else
            lyric = await this._m.modules.lyrics.fetch(this.args);

        if (!lyric) {
             this.reply('Could not find any lyrics for that song.')
                    .then(msg => msg.delete({timeout: 5e3}));

            return false;
        }

        // TODO: Prevent it from cutting words in half
        for (let i = 0; i < lyric.length; i++) {
            const richEmbed = new MessageEmbed()
                    .setDescription(lyric[i])
                    .setColor('#ff6038');

            if (i === 0)
                richEmbed.setTitle(`Lyrics for ${(title && artist) ? title + ' - ' + artist : this.args}`);

            this.reply(richEmbed);
        }

        return true;
    }
}
