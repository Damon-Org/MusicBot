const
    BaseCommand = require('../../../structs/base_command'),
    MODE = require('../../../music/dj/mode');

/**
 * @category Commands
 * @extends BaseCommand
 */
class DJDisable extends BaseCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(DJDisable, {
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
        this.serverUtils.updateGuildOption(this.serverInstance.id, 3, MODE['FREEFORALL']);
        this.db.lazyLoader.set(this.serverInstance.id, 'dj_mode', MODE['FREEFORALL']);

        this.send('The DJ system has been disabled if it wasn\'t already.');
    }
}

module.exports = DJDisable;
