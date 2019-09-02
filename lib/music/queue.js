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
            }

            throw 'Eh gwhat?';
        }

        const queue = this.queue;

        for (let i = 0; i < queue.length; i++) {
            if (queue[i].equals(song)) {
                delete this.queue[i];

                return;
            }
        }
    }

    repeat() {
        while (this.getSongFromPosition(-1) != null) {
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
    unshift() {
        return this.queue.unshift();
    }
}
