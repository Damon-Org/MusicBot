module.exports = class MusicSystem {
    constructor() {
        this.queue = new Queue();

        this.channel = null;
        this.lastMsg = null;
        
        this.paused = false;
        this.stream = null;
        this.timer  = null;
        this.repeat = 0;
        this.volume = 0.15;
    }


}
