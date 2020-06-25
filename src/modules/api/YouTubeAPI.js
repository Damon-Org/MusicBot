import youtube from 'scrape-youtube'

export default class YouTubeAPI{
    constructor() {
        this.yt = youtube.default;
    }

    /**
     * @param {String} searchFor A String to search for on Youtube
     * @returns {Promise<Object>} JSON data
     */
    search(searchFor) {
        return this.yt.search(searchFor, { limit: 5, type: 'video' });
    }

    /**
     * @param {String} searchFor A String to search for on Youtube
     * @returns {Promise<Object>} JSON data
     */
    searchOne(searchFor) {
        return this.yt.search(searchFor, { limit: 1, type: 'video' });
    }
}
