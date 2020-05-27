const
    DJUser = require('./user'),
    MODE = require('./mode');

class DJManager extends Map {
    /**
     * @param {MusicSystem} musicSystem
     */
    constructor(musicSystem) {
        super();

        this.musicSystem = musicSystem;

        this.revokeTime = 12e4;

        this.reset(true);
    }

    /**
     * @param {external:Discord_GuildMember}
     */
    add(serverMember) {
        if (this.mode != MODE['MANAGED']) return;

        this.set(serverMember.id, new DJUser(this, serverMember));
    }

    /**
     * @param {external:String} serverMemberId
     */
    has(serverMemberId) {
        if (this.mode != MODE['MANAGED']) return true;

        return super.has(serverMemberId);
    }

    join(serverMember) {
        if (this.mode != MODE['MANAGED']) return;

        const djUser = this.get(serverMember.id);

        if (djUser) {
            djUser.clear();
        }
    }

    reset(hard = false) {
        if (hard) this.mode = this.musicSystem.musicBot.lazyLoader.get(this.musicSystem.serverInstance.id, 'dj_mode') || MODE['MANAGED'];
        this.playlistLock = false;

        this.forEach((djUser) => {
            djUser.clear();

            this.delete(djUser.id);
        });
    }

    /**
     * @param {external:Discord_GuildMember}
     */
    remove(serverMember) {
        if (this.mode != MODE['MANAGED']) return;

        const djUser = this.get(serverMember.id);

        if (djUser && this.size == 1) {
            djUser.revokeDelay(this.revokeTime);
        }
    }

    resign(serverMember) {
        const djUser = this.get(serverMember.id);
        djUser.clear();

        if (djUser && this.size == 1) {
            this.setMode(MODE['FREEFORALL']);

            this.musicSystem.channel.send(`${serverMember} has resigned as DJ, all users in voice channel can now use music commands.`);

            return;
        }

        this.delete(djUser.id);
    }

    setMode(mode) {
        this.mode = mode;

        this.reset();
    }
}

module.exports = DJManager;
