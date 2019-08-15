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
        const length = is.size();

        this.queue.splice(length - 2, 0, song);
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

    reset() {
        for (let i = 0; i < this.maxPrequeue; i++) {
            this.queue[i] = null;
        }
    }

    size() {
        return this.queue.length;
    }
}
