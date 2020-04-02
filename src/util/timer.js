/**
 * This class goes unused at the time
 * @category Util
 * @deprecated
 */
class Timer {
    /**
     * @constructs
     * @param {external:Function_Callback} funcCallback A valid function reference
     * @param {external:Number} delay A number for the delay of the timer
     */
    constructor(funcCallback, delay) {
        this.created = new Date();
        this.paused = false;
        this.remainingTime = delay;
        this.start = null;
        this.callback = funcCallback;

        this.resume();
    }

    destroy() {
        clearTimeout(this.internalTimer);
    }

    pause() {
        clearTimeout(this.internalTimer);
        this.internalTimer = null;

        this.remainingTime -= Date.now() - this.start;

        this.paused = true;
    }

    resume() {
        this.start = this.created;

        if (this.internalTimer) {
            clearTimeout(this.internalTimer);
        }

        this.internalTimer = setTimeout(this.callback, this.remainingTime);
        this.paused = false;
    }
}

module.exports = Timer;
