const
    clientId        = 'fda3b967e9e545a691cb359f933b52aa',
    clientSecret    = '4de0243f5d864a3dbbfb81af5901a57d',

    SpotifyWebAPI = require('spotify-web-api-node');

class SpotifyAPI extends SpotifyWebAPI {
    /**
     * @param {DamonBase} damonBase
     */
    constructor(damonBase) {
        super({
            clientId: clientId,
            clientSecret: clientSecret
        });

        this.db = damonBase;

        this.expired = false;

        this.updateAccessToken();
    }

    async updateAccessToken() {
        try {
            const data = await this.clientCredentialsGrant();

            this.expires = data.body['expires_in'];
            this.access_token = data.body['access_token'];

            this.setAccessToken(this.access_token);

            this.db.log('API', 'INFO', `Spotify access_token: '${this.access_token}'`);

            this.expired = false;
        } catch (e) {
            this.db.log('API', 'ERROR', `Failed to updated access_token for Spotify:\n${e.stack}`);
        }

        setTimeout(() => {
            this.expired = true;
        }, this.expires * 1e3);
    }

    async getTrack(a1) {
        if (this.expired) await this.updateAccessToken();

        return super.getTrack(a1);
    }

    async getAlbum(a1) {
        if (this.expired) await this.updateAccessToken();

        return super.getAlbum(a1);
    }

    async getPlaylist(a1) {
        if (this.expired) await this.updateAccessToken();

        return super.getPlaylist(a1);
    }
}

module.exports = SpotifyAPI;
