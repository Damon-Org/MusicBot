const User = require('../structs/user.js');

/**
 * User Utilities class
 * @category Util
 */
class UserUtils {
    /**
     * @param {DamonFramework} df DamonFramework instance
     */
    constructor(damonFramework) {
        /**
         * @type {DamonFramework}
         */
        this.df = damonFramework;
    }

    async addUserIfNotExists(userId) {
        let
            [rows, fields] = await this.df.db.query(`SELECT internal_id FROM core_users WHERE discord_id = '${userId}'`),
            id;

        if (rows.length == 0) {
            [rows, fields] = await this.df.db.query(`INSERT INTO core_users (discord_id) VALUES ('${userId}')`);

            id = rows.insertId;
        }

        if (!id) id = rows[0].internal_id;

        return id;
    }

    async getClassInstance(userId) {
        const userMap = this.df.users;

        if (userMap.has(userId)) {
            return userMap.get(userId);
        }

        const instance = new User(this.df, await this.df.client.users.fetch(userId));
        this.df.users.set(userId, instance);

        return instance;
    }

    /**
     * @param {external:String} userId A string or number that identifies a user
     * @param {external:Number} role_lvl A number that represents what role this user needs to have at least
     * @returns {external:Boolean} Return true if the user has the mininam required level, false otherwise
     */
    async hasRequiredMinimalRole(userId, role_lvl) {
        const [rows, fields] = await this.df.db.query(`SELECT role_id FROM core_users WHERE discord_id = '${userId}' AND role_id <= ${role_lvl} AND not role_id = 0`);

        if (rows.length == 0) {
            return false;
        }

        return true;
    }

    /**
     * @param {external:String|external:Number} userId A string or number that identifies a user
     * @param {external:String|external:Number} property A string or number of the property to update
     * @param {*} value The new value for the property
     */
    async updateUserProperty(userId, property, value) {

    }
}

module.exports = UserUtils;
