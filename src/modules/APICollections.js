import BaseModule from '../structures/modules/BaseModule.js'

import SpotifyAPI from './api/SpotifyAPI.js'
import YouTubeAPI from './api/YouTubeAPI.js'

export default class APICollections extends BaseModule {
    /**
     * @param {MainClient} mainClient
     */
    constructor(mainClient) {
        super(mainClient);

        this.register(APICollections, {
            name: 'api'
        });
    }

    setup() {
        this.youtube = new YouTubeAPI();
        this.spotify = new SpotifyAPI(this.auth.credentials.api.spotify);
    }
}
