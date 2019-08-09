class Queue {
    constructor() {
        this.repeat = false;
        this.queue = [];

        this.resetQueue();
    }

    resetQueue() {
        for (let i = 0; i < this.maxPrequeue; i++) {
            this.queue[i] = null;
        }
    }
}
