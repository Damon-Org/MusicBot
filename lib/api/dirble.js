class DirbleAPI {
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
	DirbleAPI:DirbleAPI
}