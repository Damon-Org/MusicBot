const
    API = new (require('./api.js')),
    ytdl = require('ytdl-core');

module.exports = class Song {
    /**
     * @constructs
     * @param {string|number} id A string or number that can uniquely identify the
     * @param {string} source A unique string identifier this can be (yt: youtube, sc: soundcloud)
     */
    constructor(id, source, list = null) {
        this.id = id;
        this.source = source;
        this.list = list;

        this.length = 0;
        this.requester = null;
        this.repeat = false;

        this.author = null;
        this.title = null;
        this.thumbnail = null;
        this.viewcount = null;
    }

    /**
     * @param {Song} song A Song instance
     * @returns {Boolean} Compares two Songs and returns true if they match
     */
    equals(song) {
        if (song == null || song == undefined) {
            return false;
        }

        if (this.id == song.id && this.source == song.source) {
            return true;
        }

        return false;
    }

    /**
     * Retrieves the song's title
     * @returns {String} Song Title
     */
    getTitle() {
        return this.title;
    }

    /**
     * Will get a stream from API
     * @returns An audio stream
     */
    async getStream() {
        switch (this.source) {
            case 'yt': {
                const options = {quality: 'highest', highWaterMark: 1024 * 1024 * 10};

                return ytdl('https://youtu.be/' + this.id, options);
            }
            default: {
                throw 'Invalid audio source';
            }
        }
    }

    getOverflownTitle() {
        let title = this.title;

        if (title > 60) {
            title = title.substr(0, 60 - '...'.length) + '...';
        }

        return title;
    }

    /**
     * Will set the requester of the song
     * @param {Discord.GuildMember} serverMember A Discord.GuildMember instance
     */
    setRequester(serverMember) {
        this.requester = serverMember;
    }

    /**
     * Will use the API to get this song its information.
     */
    async updateInformation() {
        switch (this.source) {
            case 'yt': {
                const data = await API.getSongInfo(this.id);

                this.author = { name: data.author.name, avatar: data.author.avatar, url: data.author.channel_url };
                this.title = data.title;
                this.viewcount = data.player_response.videoDetails.viewCount;

                this.length = data.player_response.videoDetails.lengthSeconds;

                break;
            }
            default: {
                this.author = { name: 'Unknow author', avatar: null, url: null };
                this.title = 'Unknow song';
                this.viewcount = 'API Error';
            }
        }

        return true;
    }
}
