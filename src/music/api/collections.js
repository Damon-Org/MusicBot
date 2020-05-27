const
    SpotifyAPI = require('./spotify'),
    YouTubeAPI = require('./youtube');
    //soundCloudId = '853fdb79a14a9ed748ec9fe482e859dd';
    //soundCloudId = '788bebab07b8a2a6282710fe2a80467c';
    //soundCloudId = 'cb4917402e7e92b3908cfaf84f52fe45';
    //soundCloudId = '772e2ee341f72103d1767764fec45d59';
    //soundCloudId = 'ec8f5272bde9a225c71692a876603706';

class APICollections {
    /**
     * @param {DamonBase} damonBase
     */
    constructor(damonBase) {
        this.spotify = new SpotifyAPI(damonBase);

        this.youtube = new YouTubeAPI();
    }
}

module.exports = APICollections;
