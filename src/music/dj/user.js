const MODE = require('./mode');

class DJUser {
    /**
     * @param {DJManager} djManager
     * @param {external:Discord_GuildMember} serverMember
     */
    constructor(djManager, serverMember) {
        this.manager = djManager;

        this.member = serverMember;

        this.id = serverMember.id;

        this._revokeMessage = null;
        this._revokeTimeout = null;
    }

    clear() {
        clearTimeout(this._revokeTimeout);

        this._revokeTimeout = null;
    }

    revokeNow() {
        this.manager.delete(this.id);

        if (this.manager.size == 0) {
            this.manager.setMode(MODE['FREEFORALL']);

            if (this._revokeMessage) {
                this._revokeMessage.then(msg => msg.delete());

                this._revokeMessage = null;
            }
        }
    }

    revokeDelay(timeout) {
        this._revokeTimeout = setTimeout(() => {
            this.revokeNow();
        }, timeout);

        this._revokeMessage = this.manager.musicSystem.channel.send(`${this.member}, you've left the voice channel, if you do not rejoin within ${timeout / 12e4} minute your role as DJ will be revoked and given to someone else.`);
    }
}

module.exports = DJUser;
