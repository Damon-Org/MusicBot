import Discord from 'discord.js'
import User from '../structures/User.js'

/**
 * A map of user structures mapped by their discord id
 */
export default class UserManager extends Map {
    /**
     * @param {MainClient} mainClient
     */
    constructor(mainClient) {
        super();

        this.mainClient = mainClient;
    }

    /**
     * @param {User|String} userResolvable A Discord.js User instance or Discord User ID
     */
    get(userResolvable) {
        const user_id = userResolvable instanceof Discord.User ? userResolvable.id : userResolvable;

        if (this.has(user_id)) {
            return super.get(user_id);
        }

        let user = userResolvable instanceof Discord.User ? userResolvable : this.mainClient.users.cache.get(user_id);
        user = new User(this.mainClient, user);

        this.set(user_id, user);

        return user;
    }
}
