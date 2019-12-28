const
    ytdl = require('ytdl-core'),
    { google } = require('googleapis');
    //soundCloudId = '853fdb79a14a9ed748ec9fe482e859dd';
    //soundCloudId = '788bebab07b8a2a6282710fe2a80467c';
    //soundCloudId = 'cb4917402e7e92b3908cfaf84f52fe45';
    //soundCloudId = '772e2ee341f72103d1767764fec45d59';
    //soundCloudId = 'ec8f5272bde9a225c71692a876603706';

module.exports = class API {
    /**
     * @constructs
     */
    constructor() {
        this.yt = google.youtube({
            version: 'v3',
            auth: 'AIzaSyDttVSLrswRkoH_AIlx45nVrEfIp4TxsLs'
        });
    }

    /**
     * @param {String} searchFor A String to search for on Youtube
     * @returns {Object} JSON data
     */
    async searchYoutube(searchFor) {
        const res = await this.yt.search.list({
            part: 'id,snippet',
            q: searchFor
        });
        return res.data.items;
    }

    /**
     * Fetches Information from the requested YT Video Id
     * @param {String} videoId A Youtube Video ID
     * @returns {Object} JSON data with the song's information
     */
    async getSongInfo(videoId) {
        const data = await ytdl.getInfo(`https://youtu.be/${videoId}`);
        return data;
    }

    /**
     * @param {String} listId A Youtube Playlist ID
     */
    async getYoutubePlaylist(listId) {
        const res = await this.yt.playlistItems.list({
            part: 'snippet',
            playlistId: listId,
            maxResults: 25
        });
        return res.data.items;
    }

}