const
    MusicCommand = require('../../structs/music_command.js'),

    LavaTrack = require('../../music/track/lava'),
    SpotifyTrack = require('../../music/track/spotify');

/**
 * @category Commands
 * @extends MusicCommand
 */
class PlayNext extends MusicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(PlayNext, {
            category: category,
            guild_only: true,

            name: 'play next',
            aliases: [
                'pn',
                'playnext'
            ],
            description: 'Adds song directly after currently playing song, if no music is playing a queue will be created and the song will be played instead.',
            usage: 'play next <search>',
            params: [
                {
                    name: 'search',
                    description: 'Search on YouTube or use a YouTube link.',
                    type: 'string',
                    required: true,
                    allow_sentence: true
                }
            ],
            example: 'play https://www.youtube.com/watch?v=rVHn3GOXvzk'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        if (this.args.length == 0) {
            this.reply('I can\'t search for nothing... Please give me something to search for.')
                .then(msg => msg.delete({timeout: 5e3}));

            return false;
        }

        const noticeMsg = this.send('🔍 `Looking up your request...` 🔍');

        let data = null;

        switch (this.musicUtils.checkRequestType(this.args)) {
            case 0: {
                data = await this.db.carrier.getNode().rest.resolve(this.args[0]);

                if (!data) {
                    const richEmbed = new this.db.Discord.MessageEmbed()
                        .setTitle('I could not find the track you requested')
                        .setDescription(`No results returned for ${this.args.join(' ')}.`)
                        .setColor('#ed4337');

                    this.send(richEmbed);

                    return true;
                }

                if (Array.isArray(data)) {
                    if (data.length > 0) {
                        const orig = (new URL(this.args[0])).searchParams.get('v');

                        this.musicUtils.createPlaylistFoundEmbed(orig, data, this.msgObj, noticeMsg, true);

                        return true;
                    }

                    const richEmbed = new this.db.Discord.MessageEmbed()
                        .setTitle('Playlist Error')
                        .setDescription(`A playlist was found but did not contain any songs.`)
                        .setColor('#ed4337');

                    this.send(richEmbed);

                    return true;
                }

                data = new LavaTrack(data);

                break;
            }
            case 1: {
                const spotify = new URL(this.args[0]).pathname;

                if (spotify.includes('/playlist/')) {
                    const playlist = (await this.db.api.spotify.getPlaylist(spotify.split('/playlist/')[1])).body;

                    noticeMsg.then(msg => msg.delete());
                    this.send(`I added the playlist **${playlist.name}** with **${playlist.tracks.items.length}** tracks!`);

                    for (const item of playlist.tracks.items) {
                        const spotifyTrack = new SpotifyTrack(item.track, this.db);

                        if (!await this.musicUtils.handleSongData(spotifyTrack, this.serverMember, this.msgObj, this.voiceChannel, null, false, false)) break;
                    }

                    return true;
                }
                else if (spotify.includes('/track/')) {
                    const track = (await this.db.api.spotify.getTrack(spotify.split('/track/')[1])).body;

                    data = new SpotifyTrack(track, this.db);
                }
                else {
                    this.send('I have no idea what to do with that spotify link? <:thinking_hard:560389998806040586>')
                        .then(msg => msg.delete({timeout: 5e3}));

                    return true;
                }

                break;
            }
            default: {
                this.musicUtils.createNewChoiceEmbed(this.msgObj, this.args.join(' '), noticeMsg, true);

                return true;
            }
        }

        this.musicUtils.handleSongData(data, this.serverMember, this.msgObj, this.voiceChannel, noticeMsg, true);

        return true;
    }
}

module.exports = PlayNext;
