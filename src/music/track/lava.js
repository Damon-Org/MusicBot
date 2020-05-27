/**
 * @category MusicSystem
 */
class LavaTrack {
    /**
     * @param {external:Object} data Data found by the LavaLink REST APi
     */
    constructor(data) {
        /*
        {
            "track": "QAAAjQIAJVJpY2sgQXN0bGV5IC0gTmV2ZXIgR29ubmEgR2l2ZSBZb3UgVXAADlJpY2tBc3RsZXlWRVZPAAAAAAADPCAAC2RRdzR3OVdnWGNRAAEAK2h0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9ZFF3NHc5V2dYY1EAB3lvdXR1YmUAAAAAAAAAAA==",
            "info": {
                "identifier": "dQw4w9WgXcQ",
                "isSeekable": true,
                "author": "RickAstleyVEVO",
                "length": 212000,
                "isStream": false,
                "position": 0,
                "title": "Rick Astley - Never Gonna Give You Up",
                "uri": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            }
        }
        */
        Object.assign(this, data);
    }

    get author() {
        return this.info.author;
    }

    get full_author() {
        return this.author;
    }

    get title() {
        return this.info.title;
    }

    isSeekable() {
        return this.info.isSeekable;
    }
}

module.exports = LavaTrack;
