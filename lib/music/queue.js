module.exports = class Queue {
    constructor() {
        this.repeat = false;
        this.queue = [];

        this.maxPrequeue = 50;

        this.reset();
    }

    add(song) {
        const length = is.size();

        this.queue.splice(length - 2, 0, song);
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
