import BaseCommand from '../../../structures/commands/BaseCommand.js'

export default class DJPersistMode extends BaseCommand {
    /**
     * @param {String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(DJPersistMode, {
            category: category,
            guild_only: true,

            name: 'persistmode',
            aliases: [
                'persist mode'
            ],
            description: 'This will enforce a set DJ mode on the server.',
            usage: 'dj persistmode <# mode>',
            params: [
                {
                    name: 'mode',
                    description: 'The new mode to be used for DJ\'s',
                    type: 'number',
                    required: true
                }
            ],
            example: 'dj persistmode'
        });

        const mode = this._m.modules.getConstants('music');
        this.mode = mode;
    }

    /**
     * @param {String} command string representing what triggered the command
     */
    async run(command) {
        const mode = this.mode[this.args[0].toUpperCase()];
        if (mode) {
            this.music.djManager.setMode(mode, true);

            this.send(`Changed DJ mode to \`${this.args[0].toUpperCase()}\``);

            return true;
        }

        this.send(`Unknown DJ mode, use \`${this.server.prefix}dj info\` to get more information around the DJ system.`)
            .then(msg => msg.delete({timeout: 5e3}));

        return true;
    }
}
