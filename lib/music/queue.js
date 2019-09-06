module.exports = class Queue {
    constructor() {
        this.repeat = false;
        this.queue = [];

        this.maxPrequeue = 50;
    }

    /**
     * @returns {Song} Active Song
     */
    active() {
        return this.queue[this.maxPrequeue];
    }

    /**
     * @param {Song} song A Song instance
     */
    add(song) {
        const length = this.size();

        this.queue.splice(length - 1, 0, song);
    }

    addSongInPosition(song, position) {
        if (position > 0) {
            position--;

            return this.queue.splice(this.maxPrequeue + position, 0, song);
        }

        return this.queue.splice(this.maxPrequeue + position, 0, song);
    }

    /**
     * @param {Number} index
     */
    get(index) {
        return this.queue[index];
    }

    /**
     * @param {Number} position Position in queue
     * @returns {Song} Returns the song from the requested position
     */
    getSongFromPosition(position) {
        if (position > 0) {
            position--;

            return this.queue[this.maxPrequeue + position];
        }

        return this.queue[this.maxPrequeue + position];
    }

    /**
     * @param {Song} song A song instance
     */
    remove(song) {
        if (song == null) {
            const check = this.active();
            if (check == null) {
                this.queue.splice(this.maxPrequeue, 1);
                this.queue.unshift(null);

                return true;
            }

            return false;
        }

        const queue = this.queue;

        for (let i = 0; i < queue.length; i++) {
            if (song.equals(queue[i])) {
                this.queue.splice(i, 1);

                return true;
            }
        }

        return false;
    }

    /**
     * Removes a song by the position in queue
     */
    removeSongByPosition(position) {
        position = parseInt(position, 10);

        if (position > 0) {
            position--;
        }

        this.queue.splice(this.maxPrequeue + position, 1);

        if (position < 0) {
            this.unshift(null);
        }

        return true;
    }

    /**
     * Resets the queue
     * @returns {Boolean} True when done
     */
    reset() {
        this.queue = [];

        for (let i = 0; i < (this.maxPrequeue + 1); i++) {
            this.queue[i] = null;
        }

        return true;
    }

    /**
     * Will rewind till the first song in queue
     */
    rewind() {
        while (this.getSongFromPosition(-1) != null) {
            this.unshift(null);
        }

        return true;
    }

    /**
     * @returns The removed element of the array
     */
    shift() {
        return this.queue.shift();
    }

    /**
     * @returns The current queue length
     */
    size() {
        return this.queue.length;
    }

    /**
     * Does the same as calling unshift on queue directly
     * @returns {Number} New length value of queue
     */
    unshift(value) {
        return this.queue.unshift(value);
    }
}
