import AdministratorCommand from '@/src/structures/commands/AdministratorCommand.js'
import Util from '@/src/util/Util.js'

export default class UnbanUser extends AdministratorCommand {
    /**
     * @param {string} category
     * @param {Main} main
     */
    constructor(category, main) {
        super(main);

        this.register(UnbanUser, {
            category: category,
            hidden: true,

            name: 'unban user',
            aliases: [
                'unbanuser'
            ],
            description: 'Revoke a ban from a user',
            usage: 'unban user <@ user>',
            params: [
                {
                    name: 'user',
                    description: 'The user to be unbanned.',
                    type: 'user',
                    required: true
                }
            ],
            example: ''
        });
    }

    get admin_level() {
        return 2;
    }

    /**
     * @param {string} trigger string representing what triggered the command
     */
    async run(trigger) {
        const reason = !this.args[1] ? null : this.args.slice(1).join(' ');
        let userId = this.args[0];

        if (isNaN(this.args[0])) {
            const mention = this.msgObj.mentions.users.last();
            if (!mention) {
                this.send('Invalid mention.');

                return true;
            }

            userId = mention.id;
        }

        if (!this._m.users.cache.has(userId) && !await this._m.users.fetch(userId)) {
            this.send('Unknown user id, I may not share a server with this user.');

            return true;
        }

        const user = this.users.get(userId);
        if (!await user.isBanned()) {
            this.send('The user is not banned!');

            return true;
        }

        let result = { timeout: true };

        for (let i = 0; result.timeout && i < 5; i++) {
            result = await this.ws.sendEvent('USER_UPDATE', 'GROUP', 'self', {
                id: userId,
                props: {
                    banned: false
                }
            }, true, 2e3);

            if (result.timeout) {
                const msg = this.send('The request timed out, retrying in 5 seconds.');
                await Util.delay(5e3);
                msg.then(msg => msg.delete());
            }
        }

        if (result.timeout) {
            this.send(`Some Shards timed out while unbanning the user, the user might not have been unbanned on some Shards. Only ${result.length} of ${this._m.shard.count} answered.`);
        }

        if (await user.options.unban()) {
            this.send(`User has been unbanned.`);
        }

        return true;
    }
}
