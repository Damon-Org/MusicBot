import BaseCommand from '../../../structures/commands/BaseCommand.js'

export default class DJDisable extends BaseCommand {
    /**
     * @param {String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(DJDisable, {
            category: category,
            guild_only: true,

            name: 'disable',
            aliases: [],
            description: 'Disable the DJ system.',
            usage: 'dj disable',
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
            example: 'dj disable'
        });

        const mode = this._m.modules.getConstants('music');
        this.mode = mode;
    }

    /**
     * @param {String} command string representing what triggered the command
     */
    async run(command) {
        const
            guildSetting = this.getModule('guildSetting'),
            currentMode = guildSetting.get(this.server.id, 'dj_mode');

        if (!currentMode || currentMode == this.mode['FREEFORALL']) {
            this.send('The DJ system is already disabled.');

            return true;
        }

        this.server.options.delete(3);
        guildSetting.set(this.server.id, 'dj_mode', this.mode['FREEFORALL']);

        this.send('The DJ system has been disabled.');

        return true;
    }
}
