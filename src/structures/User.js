export default class User {
    /**
     * @param {Main} main
     * @param {User} user
     */
    constructor(main, user) {
        this._m = main;

        this.user = user;

        this._initUserModules();
    }

    /**
     * Initializes all registered server modules and clones their instances into the server class
     */
    _initUserModules() {
        const modules = this._m.modules.getScope('user');

        for (const [ name, module ] of modules) {
            this[name] = module.clone(this);
        }
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

            return false;
        }

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
