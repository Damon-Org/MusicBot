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

        this.updateAccessToken();
    }

    async updateAccessToken() {
        try {
            const data = await this.clientCredentialsGrant();

            this.expires = data.body['expires_in'];
            this.access_token = data.body['access_token'];

            this.setAccessToken(this.access_token);

            this.db.log('API', 'INFO', `Spotify access_token: '${this.access_token}'`);
        } catch (e) {
            this.db.log('API', 'ERROR', `Failed to updated access_token for Spotify:\n${e.stack}`);
        }

        setTimeout(() => {
            this.updateAccessToken();
        }, this.expires * 1e3);
    }
}

module.exports = SpotifyAPI;
