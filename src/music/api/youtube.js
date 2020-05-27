const YouTubeScraper = require('scrape-youtube').default;

class YouTubeAPI {
    constructor() {
        this.yt = YouTubeScraper;
    }

    /**
     * @param {external:String} searchFor A String to search for on Youtube
     * @returns {external:Object} JSON data
     */
    async search(searchFor) {
        return await this.yt.search(searchFor, { limit: 5, type: 'video' });
    }
}

module.exports = YouTubeAPI;
