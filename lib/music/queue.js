module.exports = class Queue {
    constructor() {
        this.maxPrequeue = 50;

        this.reset();
    }

    /**
     * @returns {Song} Active Song
     */
    active() {
        return this.queue[this.maxPrequeue];
    }

    /**
     * @param {Object} data Data found by the LavaLink REST APi
     */
    add(data) {
        const length = this.size();

        this.queue.splice(length - 1, 0, data);
    }

    /**
     * @param {Object} data Data found by the LavaLink REST APi
     * @param {Number} position
     */
    addOnPosition(song, position) {
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
     * @returns {Object} data Data found by the LavaLink REST APi
     */
    getFromPosition(position) {
        if (position > 0) {
            position--;

            return this.queue[this.maxPrequeue + position];
        }

        return this.queue[this.maxPrequeue + position];
    }

    /**
     * @param {Object} data Data found by the LavaLink REST APi
     * @returns {Boolean} Returns true if has found a match and remove the song
     */
    remove(data) {
        if (data == null) {
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
            if (data.info.identifier == queue[i].info.identifier) {
                this.queue.splice(i, 1);

                return true;
            }
        }

        return false;
    }

    /**
     * Removes a song by the position in queue
     */
    removeOnPosition(position) {
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
        this.repeat = false;
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
    }

    /**
     * @returns The removed element of the array
     */
    shift() {
        return this.queue.shift();
    }

    /**
     * @returns {Number} The current queue length
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
