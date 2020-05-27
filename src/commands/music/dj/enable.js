const
    BaseCommand = require('../../../structs/base_command'),
    MODE = require('../../../music/dj/mode');

/**
 * @category Commands
 * @extends BaseCommand
 */
class DJEnable extends BaseCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(DJEnable, {
            category: category,
            guild_only: true,

            name: 'enable',
            aliases: [],
            description: 'Re-enabled the DJ system.',
            usage: 'dj enable',
            params: [
                {
                    name: 'mention',
                    description: 'The user to be added.',
                    type: 'mention',
                    required: true
                }
            ],
            permissions: {
                logic: 'OR',
                levels: [
                    {
                        type: 'server',
                        name: 'MANAGE_CHANNELS'
                    }
                ]
            },
            example: 'dj enable'
        });
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        this.serverUtils.updateGuildOption(this.serverInstance.id, 3, MODE['MANAGED']);
        this.db.lazyLoader.set(this.serverInstance.id, 'dj_mode', MODE['MANAGED']);

        this.send('The DJ system has been re-enabled if it wasn\'t already.');
    }
}

module.exports = DJEnable;
