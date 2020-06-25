export default class MusicQueue extends Array {
    constructor() {
        super();

        this.maxPrequeue = 50;

        this.maxQueue = 350;

        this.reset();
    }

    get start() {
        let start = this.maxPrequeue;

        do {
            if (this[start - 1] == null) return start;

            start--;
        } while (start > 0);

        return start;
    }

    /**
     * @returns {LavaTrack|SpotifyTrack} Active Song
     */
    active() {
        return this[this.maxPrequeue];
    }

    /**
     * @param {LavaTrack|SpotifyTrack} track Data found by the LavaLink REST APi
     * @returns {Boolean} Returns true on success, false if queue is full
     */
    add(track) {
        if (this.length == this.maxQueue) return false;

        this.splice(this.length - 1, 0, track);

        return true;
    }

    /**
     * @param {external:Object} data Data found by the LavaLink REST APi
     * @param {external:Number} position
     * @returns {external:Boolean} Returns true on success, false if queue is full
     */
    addOnPosition(song, position) {
        if (this.length == this.maxLength) return false;

        if (position > 0) {
            position--;

            this.queue.splice(this.maxPrequeue + position, 0, song)

            return true;
        }
        this.queue.splice(this.maxPrequeue + position, 0, song);

        return true;
    }

    clear() {
        this.length = 0;
    }

    count() {
        return this.length - this.start;
    }

    /**
     * @param {external:Number} position Position in queue
     * @returns {external:Object} data Data found by the LavaLink REST APi
     */
    getFromPosition(position) {
        if (position > 0) {
            position--;

            return this[this.maxPrequeue + position];
        }

        return this[this.maxPrequeue + position];
    }

    /**
     * @param {external:Number} index
     */
    hasOnPosition(index) {
        if (this.getFromPosition(index)) {
            return true;
        }
        return false;
    }

    /**
     * Removes a song by the position in queue
     */
    removeOnPosition(position) {
        position = parseInt(position);

        if (position > 0) {
            position--;
        }

        if (position == 0) {
            this[this.maxPrequeue + position] = null;

            return true;
        }

        this.splice(this.maxPrequeue + position, 1);

        if (position < 0) {
            this.unshift(null);
        }

        return true;
    }

    reset() {
        /**
         * Is repeat enabled
         * @type {Boolean}
         */
        this.repeat = false;

        this.clear();

        for (let i = 0; i < (this.maxPrequeue + 1); i++) {
            this[i] = null;
        }
    }

    reverse() {
        const
            bottomLimit = this.start,
            topLimit = this.length - 1,
            tempQueue = this.slice(bottomLimit, topLimit);

        tempQueue.reverse();

        this.splice(bottomLimit, topLimit - bottomLimit, ...tempQueue);
    }

    /**
     * Will rewind till the first song in queue
     */
    rewind() {
        while (this.getFromPosition(-1) != null) {
            this.unshift(null);
        }
    }

    shuffle() {
        const
            bottomLimit = this.start,
            topLimit = this.length - 1;

        let
            tempQueue = this.slice(bottomLimit, topLimit),
            currentIndex = tempQueue.length - 1,
            temporaryValue,
            randomIndex;

        while (0 !== currentIndex) {
            randomIndex = Math.round(Math.random() * currentIndex);

            temporaryValue = tempQueue[currentIndex];
            tempQueue[currentIndex] = tempQueue[randomIndex];
            tempQueue[randomIndex] = temporaryValue;

            currentIndex--;
        }

        this.splice(bottomLimit, topLimit - bottomLimit, ...tempQueue);
    }
}
