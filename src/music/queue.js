/**
 * MusicQueue manager class
 * @category MusicSystem
 */
class Queue {
    constructor() {
        /**
         * Max length to prequeue with empty slots for previous song support
         * @type {external:Number}
         */
        this.maxPrequeue = 50;

        /**
         * The max length the queue can have in total
         * @type {external:Number}
         */
        this.maxLength = 300;

        this.reset();
    }

    get start() {
        let start = this.maxPrequeue;

        do {
            if (this.get(start - 1) == null) return start;

            start--;
        } while (start > 0);

        return start;
    }

    /**
     * @returns {Track} Active Song
     */
    active() {
        return this.queue[this.maxPrequeue];
    }

    /**
     * @param {external:Object} data Data found by the LavaLink REST APi
     * @returns {external:Boolean} Returns true on success, false if queue is full
     */
    add(data) {
        const length = this.size();
        if (length == this.maxLength) return false;

        this.queue.splice(length - 1, 0, data);

        return true;
    }

    /**
     * @param {external:Object} data Data found by the LavaLink REST APi
     * @param {external:Number} position
     * @returns {external:Boolean} Returns true on success, false if queue is full
     */
    addOnPosition(song, position) {
        if (this.size() == this.maxLength) return false;

        if (position > 0) {
            position--;

            this.queue.splice(this.maxPrequeue + position, 0, song)

            return true;
        }
        this.queue.splice(this.maxPrequeue + position, 0, song);

        return true;
    }

    count() {
        return this.size() - this.start;
    }

    /**
     * @param {external:Number} index
     */
    get(index) {
        return this.queue[index];
    }

    /**
     * @param {external:Number} position Position in queue
     * @returns {external:Object} data Data found by the LavaLink REST APi
     */
    getFromPosition(position) {
        if (position > 0) {
            position--;

            return this.queue[this.maxPrequeue + position];
        }

        return this.queue[this.maxPrequeue + position];
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
     * @param {external:Object} data Data found by the LavaLink REST APi
     * @returns {external:Boolean} Returns true if has found a match and remove the song
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
     */
    reset() {
        /**
         * Is repeat enabled
         * @type {Boolean}
         */
        this.repeat = false;
        /**
         * @type {Track[]}
         */
        this.queue = [];

        for (let i = 0; i < (this.maxPrequeue + 1); i++) {
            this.queue[i] = null;
        }
    }

    reverse() {
        const
            bottomLimit = this.start,
            topLimit = this.size() - 1,
            tempQueue = this.queue.slice(bottomLimit, topLimit);

        tempQueue.reverse();

        this.queue.splice(bottomLimit, topLimit - bottomLimit, ...tempQueue);
    }

    /**
     * Will rewind till the first song in queue
     */
    rewind() {
        while (this.getFromPosition(-1) != null) {
            this.unshift(null);
        }
    }

    /**
     * @returns The removed element of the array
     */
    shift() {
        return this.queue.shift();
    }

    shuffle() {
        const
            bottomLimit = this.start,
            topLimit = this.size() - 1;

        let
            tempQueue = this.queue.slice(bottomLimit, topLimit),
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

        this.queue.splice(bottomLimit, topLimit - bottomLimit, ...tempQueue);
    }

    /**
     * @returns {Number} The current queue length
     */
    size() {
        return this.queue.length;
    }

    /*as calling unshift on queue directly
     * @returns {Number} New length value of queue
     */
    unshift(value) {
        return this.queue.unshift(value);
    }
}

module.exports = Queue;
