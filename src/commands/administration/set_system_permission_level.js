const BasicCommand = require('../../util/basic_command.js');

/**
 * Class name speaks for itself
 * @category Commands
 * @extends Command
 */
class SetSystemPermissionLevel extends BasicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
            category: category,
            hidden: true,

            name: 'set user system permission level',
            aliases: [
                'add system user',
                'set permission level'
            ],
            description: 'Change the system permission level of a user.',
            usage: 'ban user <@ user> [permission_level]',
            params: [
                {
                    name: 'user',
                    description: 'The user to be modified.',
                    type: 'mention',
                    required: true
                },
                {
                    name: 'permission_level',
                    description: 'The new permission level for the user.',
                    type: 'number',
                    required: true
                }
            ],
            permission: {
                type: 'system',
                level: 3
            },
            examples: []
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        let userId = this.args[0];
        const permission_level = this.args[1];

        if (isNaN(this.args[0])) {
            const mention = this.msgObj.mentions.users.last();
            if (!mention) {
                this.textChannel.send('Invalid mention.');

                return true;
            }

            userId = mention.id;
        }

        if (!await this.db.client.users.fetch(userId)) {
            this.textChannel.send('Unknown user id, I may not share a server with this user.');

            return true;
        }

        const user = await this.userUtils.getClassInstance(userId);

        if (await user.setPermissionLevel(permission_level)) {
            this.textChannel.send(`User permission level has been changed to ${permission_level}`);

            return true;
        }

        this.textChannel.send('Invalid permission level, please give a positive number.');

        return true;
    }
}

module.exports = SetSystemPermissionLevel;
