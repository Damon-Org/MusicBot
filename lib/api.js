const
    request = require('request'),
    { google } = require('googleapis'),
    soundCloudId = '853fdb79a14a9ed748ec9fe482e859dd';
    // soundCloudId = '788bebab07b8a2a6282710fe2a80467c';
    // soundCloudId = 'cb4917402e7e92b3908cfaf84f52fe45';

class API {
    constructor() {
        this.yt = google.youtube({
            version: 'v3',
            auth: 'AIzaSyDttVSLrswRkoH_AIlx45nVrEfIp4TxsLs'
        });
    }

    async searchYoutube(query, funCallback) {
        const res = await this.yt.search.list({
            part: 'id,snippet',
            q: query
        });
        return funCallback(res.data.items);
    }

    getSoundCloudTrackData(trackId, funCallback) {
        const path = `https://api.soundcloud.com/tracks/${trackId}?client_id=${soundCloudId}`;

        request(path, (err, res, body) => funCallback(JSON.parse(body)));
    }

    getSoundCloudStream(trackId) {
        const path = `https://api.soundcloud.com/tracks/${trackId}/stream?client_id=${soundCloudId}`;

        return path;
    }

    resolveSoundCloud(url, funCallback) {
        const path = `https://api.soundcloud.com/resolve?url=${url}&client_id=${soundCloudId}`;

        request(path, (err, res, body) => funCallback(JSON.parse(body)));
    }
}

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
