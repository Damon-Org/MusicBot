const
    BaseCommand = require('../../structs/base_command'),
    MODE = require('../../music/dj/mode');

/**
 * @category Commands
 * @extends BaseCommand
 */
class DJPersistMode extends BaseCommand {
    /**
     * @param {external:String} category
     * @param {Array<*>} args
     */
    constructor(category, ...args) {
        super(...args);

        this.register(DJPersistMode, {
            category: category,
            guild_only: true,

            name: 'dj persistmode',
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
    }

    /**
     * @param {external:String} command string representing what triggered the command
     */
    async run(command) {
        const mode = MODE[this.args[0].toUpperCase()];
        if (mode) {
            this.musicSystem.djManager.setMode(mode, true);

            this.send(`Changed DJ mode to \`${this.args[0].toUpperCase()}\``);

            return;
        }

        this.send(`Unknown DJ mode, use \`${this.serverInstance.prefix}dj info\` to get more information around the DJ system.`)
            .then(msg => msg.delete({timeout: 5e3}));
    }
}

module.exports = DJPersistMode;
