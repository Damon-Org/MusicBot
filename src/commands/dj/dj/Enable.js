import BaseCommand from '../../../structures/commands/BaseCommand.js'
import MODE from '../../../structures/server/music/dj/Mode.js'

export default class DJEnable extends BaseCommand {
    /**
     * @param {String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(DJEnable, {
            category: category,
            guild_only: true,

            name: 'enable',
            aliases: [],
            description: 'Enable the DJ system.',
            usage: 'dj enable',
            params: [],
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
     * @param {String} command string representing what triggered the command
     */
    async run(command) {
        const
            guildSetting = this.getModule('guildSetting'),
            currentMode = guildSetting.get(this.server.id, 'dj_mode');

        if (!currentMode || currentMode == MODE['FREEFORALL']) {
            this.server.options.update(3, MODE['MANAGED']);
            guildSetting.set(this.server.id, 'dj_mode', MODE['MANAGED']);

            this.send('The DJ system has been enabled.');

            return true;
        }

        this.send('The DJ system is already enabled!');

        return true;
    }
}
