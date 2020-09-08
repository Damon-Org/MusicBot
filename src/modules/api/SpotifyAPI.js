import SpotifyWebAPI from 'spotify-web-api-node'

import log from '../../util/Log.js'

export default class SpotifyAPI extends SpotifyWebAPI {
    constructor(credentials) {
        super({
            clientId: credentials.clientId,
            clientSecret: credentials.clientSecret
        });

        this.expired = false;

        this._updateAccessToken();
    }

    async _updateIfExpired() {
        if (this.expired) await this._updateAccessToken();
    }

    async _updateAccessToken() {
        try {
            this.expired = false;

            const data = await this.clientCredentialsGrant();

            this.expires = data.body['expires_in'];
            this.access_token = data.body['access_token'];

            this.setAccessToken(this.access_token);

            log.info('API', `Spotify access_token: '${this.access_token}'`);
        } catch (e) {
            log.error('API', `Failed to updated access_token for Spotify:\n${e.stack}`);

            this.expired = true;
        }

        setTimeout(() => {
            this.expired = true;
        }, this.expires * 1e3);
    }

    async getTrack(a1) {
        await this._updateIfExpired();

        return super.getTrack(a1);
    }

    async getAlbum(a1) {
        await this._updateIfExpired();

        return super.getAlbum(a1);
    }

    async getPlaylist(a1, offset = null, limit = 100) {
        await this._updateIfExpired();

        if (offset) {
            return (await super.getPlaylistTracks(a1, {
                offset,
                limit,
                fields: 'items'
            })).body.items;
        }

        const pl = await super.getPlaylist(a1);
        for (let i = 100; pl.body.tracks.total > 100 && i < pl.body.tracks.total; i+=100) {
            let plTracks = await this.getPlaylist(a1, i);
            pl.body.tracks.items = pl.body.tracks.items.concat(plTracks);
        }

        return pl;
    }
}
