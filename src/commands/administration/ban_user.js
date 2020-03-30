const BasicCommand = require('../../utils/basic_command.js');

/**
 * Class name speaks for itself
 * @category Commands
 * @extends Command
 */
class BanUser extends BasicCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register({
            category: category,

            name: 'ban user',
            aliases: [
                'banuser'
            ],
            description: 'Ban a user from using the bot',
            usage: 'ban user <@ user> [reason]',
            params: [
                {
                    name: 'user',
                    description: 'The user to be banned.',
                    type: 'mention',
                    required: true
                },
                {
                    name: 'reason',
                    description: 'The reason why a user was banned.',
                    type: 'string',
                    default: null,
                    allow_sentence: true
                }
            ],
            permission: {
                type: 'system',
                level: 2
            },
            examples: []
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        const reason = !this.args[1] ? null : this.args.slice(1).join(' ');
        let userId = this.args[0];

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

        const
            user = await this.userUtils.getClassInstance(userId),
            result = await user.ban(this.user.id, reason);

        if (result[0]) {
            const embed = new this.db.Discord.MessageEmbed()
                .setTitle('Ban has been issued')
                .setDescription('Don\'t ban without a valid reason.')
                .addField('Discord ID', userId)
                .addField('Ban ID', result[1])
                .addField('User Internal ID', result[2]);

            this.textChannel.send(embed);

            return true;
        }

        this.textChannel.send(result[1]);

        return true;
    }
}

module.exports = BanUser;
