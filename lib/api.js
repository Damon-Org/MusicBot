const
    request = require('request'),
    { google } = require('googleapis'),
    //soundCloudId = '853fdb79a14a9ed748ec9fe482e859dd';
    //soundCloudId = '788bebab07b8a2a6282710fe2a80467c';
    //soundCloudId = 'cb4917402e7e92b3908cfaf84f52fe45';
    //soundCloudId = '772e2ee341f72103d1767764fec45d59';
    soundCloudId = 'ec8f5272bde9a225c71692a876603706';

class API {
    /* @class constructor
     *  Sets up the api method with our api key
     */
    constructor() {
        this.yt = google.youtube({
            version: 'v3',
            auth: 'AIzaSyDttVSLrswRkoH_AIlx45nVrEfIp4TxsLs'
        });
    }

    /* @class method
     *  searches Youtube for a specific song
     */
    async searchYoutube(query, funCallback) {
        const res = await this.yt.search.list({
            part: 'id,snippet',
            q: query
        });
        return funCallback(res.data.items);
    }

    /* @class method
     *  Get songs that are inside a playlist, limited to the first 25
     */
    async getYoutubePlaylist(listId, funCallback) {
        const res = await this.yt.playlistItems.list({
            part: 'snippet',
            playlistId: listId,
            maxResults: 25
        });
        return funCallback(res.data.items);
    }

    /* @class method
     *  Gets track information from trackId, returns json
     */
    getSoundCloudTrackData(trackId, funCallback) {
        const path = `https://api.soundcloud.com/tracks/${trackId}?client_id=${soundCloudId}`;

        request(path, (err, res, body) => {
            if (res.statusCode == 406 || res.statusCode == 403) {
                return console.log('REQUEST REJECTED BY SOUNDCLOUD');
            }

            funCallback(JSON.parse(body))
        });
    }

    /* @class method
     *  Creates a valid stream url with a trackId and will return a redirected, reserved stream url
     */
    getSoundCloudStream(trackId) {
        const path = `https://api.soundcloud.com/tracks/${trackId}/stream?client_id=${soundCloudId}`;

        return path;
    }

    /* @class method
     *  Resolves a soundcloud url and returns a json with track specific info
     */
    resolveSoundCloud(url, funCallback) {
        const path = `https://api.soundcloud.com/resolve?url=${url}&client_id=${soundCloudId}`;

        request(path, (err, res, body) => {
            if (res.statusCode == 403) {
                return funCallback(false);
            }
            funCallback(JSON.parse(body));
        });
    }
}

/* @class
 *  Beginning of RadioAPI, going to work this out later
 */
class RadioAPI {
    constructor () {
        this.token = 'dea703e1ff7b6ffe2c0f95ea5c';
    }

    searchStation () {
        const url = `http://api.dirble.com/v2/search?token=${this.token}`;
    }

    getRadioStreamUrl (stringId) {
        const url = `http://api.dirble.com/v2/station/${stringId}?token=${this.token}`;
    }
}

module.exports = {
    API:API,
    RadioAPI:RadioAPI
};
