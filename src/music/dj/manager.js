const
    DJUser = require('./user'),
    MODE = require('./mode');

class DJManager {
    /**
     * @param {MusicSystem} musicSystem
     */
    constructor(musicSystem) {
        this.musicSystem = musicSystem;

        this.revokeTime = 12e4;

        this.reset(true);
    }

    upgrade(oldMap) {
        this.users = new Map(oldMap);
    }

    /**
     * @param {external:Discord_GuildMember}
     */
    add(serverMember) {
        if (this.mode != MODE['MANAGED']) return;

        this.users.set(serverMember.id, new DJUser(this, serverMember));
    }

    /**
     * @param {external:String} serverMemberId
     */
    has(serverMemberId) {
        if (this.mode != MODE['MANAGED']) return true;

        return this.users.has(serverMemberId);
    }

    join(serverMember) {
        if (this.mode != MODE['MANAGED']) return;

        const djUser = this.users.get(serverMember.id);

        if (djUser) {
            djUser.clear();
        }
    }

    reset(hard = false) {
        if (hard) this.mode = this.musicSystem.musicBot.lazyLoader.get(this.musicSystem.serverInstance.id, 'dj_mode') || MODE['FREEFORALL'];
        this.playlistLock = false;

        if (!this.users)
            this.users = new Map();

        this.users.forEach((djUser) => {
            djUser.clear();

            this.users.delete(djUser.id);
        });
    }

    /**
     * @param {external:Discord_GuildMember}
     */
    remove(serverMember) {
        if (this.mode != MODE['MANAGED']) return;

        const djUser = this.users.get(serverMember.id);

        if (djUser && this.size == 1) {
            djUser.revokeDelay(this.revokeTime);
        }
    }

    resign(serverMember) {
        const djUser = this.users.get(serverMember.id);
        djUser.clear();

        if (djUser && this.size == 1) {
            this.setMode(MODE['FREEFORALL']);

            this.musicSystem.channel.send(`${serverMember} has resigned as DJ, all users in voice channel can now use music commands.`);

            return;
        }

        this.users.delete(djUser.id);
    }

    setMode(mode, persist = false) {
        if (persist) {
            this.serverUtils.updateGuildOption(this.serverInstance.id, 'djMode', mode);

            this.db.lazyLoader.set(this.serverInstance.id, 'dj_mode', mode);
        }

        this.mode = mode;

        this.reset();
    }
}

module.exports = DJManager;
