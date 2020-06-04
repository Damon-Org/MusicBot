/**
 * @category MusicSystem
 */
class SpotifyTrack {
    /**
     * @param {external:Object} data Data found by the Spotify REST APi
     * @param {DamonBase} damonBase
     */
    constructor(data, damonBase, imageOverride = null) {
        this.db = damonBase;

        Object.assign(this, data);

        this.cached = false;
        this._done = false;

        this.imageOverride = imageOverride;
    }

    get author() {
        return this.artists[0].name;
    }

    get full_author() {
        let artist = '';

        for (let i = 0; i < this.artists.length; i++) {
            const tempArtist = this.artists[i];

            if (i == 0)
                artist += tempArtist.name;
            else if (i == 1)
                artist += ' (ft. ';

            if (i > 0) {
                artist += tempArtist.name;

                if (i+1 != this.artists.length)
                    artist += ', ';
                else
                    artist += ')';
            }
        }

        return artist;
    }

    get image() {
        if (this.imageOverride) return this.imageOverride;
        return this.album.images[0].url;
    }

    get title() {
        return `${this.author} - ${this.name}`;
    }

    done() {
        return new Promise((resolve, reject) => {
            if (this.cached) {
                resolve(true);

                return;
            }

            const timeout = setTimeout(() => {
                resolve(false);

                this._done = false;
            }, 2e4);

            this._done = () => {
                resolve(true);

                clearTimeout(timeout);
            };
        });
    }

    async getYouTubeEquiv() {
        if (this.cached) return true;
        if (this.caching)
            return this.done();

        this.caching = true;

        let
            attempt = 0,
            ytSearch = null;

        do {
            ytSearch = await this.db.api.youtube.search(this.title + ' audio');

            attempt++;
        } while ((!ytSearch || ytSearch.length == 0 || !ytSearch[0].id || typeof ytSearch !== 'object') && attempt < 3);

        if (!ytSearch || ytSearch.length == 0 || !ytSearch[0].id || typeof ytSearch !== 'object') {
            this.broken = true;

            return false;
        }


        let data = null;
        attempt = 0;
        do {
            data = await this.db.carrier.getNode().rest.resolve(`https://youtu.be/${ytSearch[0].id}`);

            attempt++;
        } while ((data == null || data === true) && attempt < 3 );

        if (!data || data === true) {
            this.broken = true;

            return false;
        }

        this.track = data.track;

        this.db.log('API', 'INFO', `Cached song: ${this.title}`);

        if (this._done)
            this._done();

        this.cached = true;

        return true;
    }

    isSeekable() {
        return true;
    }
}

module.exports = SpotifyTrack;
