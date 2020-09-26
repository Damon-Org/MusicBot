import BaseCommand from '../../../structures/commands/BaseCommand.js'

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

        const mode = this._m.modules.getConstants('music');
        this.mode = mode;
    }

    /**
     * @param {string} command string representing what triggered the command
     */
    async run(command) {
        const
            guildSetting = this.getModule('guildSetting'),
            currentMode = guildSetting.get(this.server.id, 'dj_mode');

        if (!currentMode || currentMode == this.mode['FREEFORALL']) {
            this.server.options.update(3, this.mode['MANAGED']);
            guildSetting.set(this.server.id, 'dj_mode', this.mode['MANAGED']);

            this.send('The DJ system has been enabled.');

            return true;
        }

        this.send('The DJ system is already enabled!');

        return true;
    }
}
