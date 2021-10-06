import Scope from './Scope.js'

export default class User extends Scope {
    /**
     * @param {Main} main
     * @param {User} user Discord User
     */
    constructor(main, user) {
        super();

        this._m = main;

        this.user = user;

        this.initScope('user');
    }

    get id() {
        return this.user.id;
    }

    /**
     * @param {number} level
     * @param {string} condition
     */
    async hasPermission(level, condition) {
        if (!['<', '<=', '==', '>', '>='].includes(condition)) {
            throw new Error('Invalid condition was passed!');
        }
        await this.settings.awaitData();

        // at this point the user's data should be fetched
        const permLevel = this.settings.data.level;

        // eval("5 <= 4") == false
        // eval("5 <= 6") == true
        return eval(permLevel + condition + level);
    }

    async isBanned() {
        await this.settings.awaitData();

        if (!this.settings.data.ban_case) return false;

        return this.settings.data.ban_case.banned;
    }
}
