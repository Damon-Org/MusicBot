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
        if (this.expired) await this.updateAccessToken();
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

    async getPlaylist(a1) {
        await this._updateIfExpired();

        return super.getPlaylist(a1);
    }
}
