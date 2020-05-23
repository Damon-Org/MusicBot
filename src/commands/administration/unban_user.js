const BaseCommand = require('../../structs/base_command.js');

/**
 * Class name speaks for itself
 * @category Commands
 * @extends Command
 */
class UnbanUser extends BaseCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
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
                    type: 'mention',
                    required: true
                }
            ],
            sysem_permission: {
                level: 2,
                condition: '<='
            },
            example: 'unban user @Geop'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        let userId = this.args[0];

        if (isNaN(this.args[0])) {
            const mention = this.msgObj.mentions.users.last();
            if (!mention) {
                this.textChannel.send('Invalid mention.');

                return true;
            }

            userId = mention.id;
        }

        if (!this.db.client.users.fetch(userId)) {
            this.textChannel.send('Unknown user id, I may not share a server with this user.');

            return true;
        }

        const user = this.userUtils.getClassInstance(userId);
        if (await user.options.unban()) {
            this.textChannel.send(`User has been unbanned.`)
        }

        return true;
    }
}

module.exports = UnbanUser;
